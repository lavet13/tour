import { Resolvers } from '@/graphql/__generated__/types';
import { Prisma, Role } from '@prisma/client';
import mime from 'mime-types';

import {
  ResolversComposerMapping,
  composeResolvers,
} from '@graphql-tools/resolvers-composition';
import { GraphQLError } from 'graphql';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { applyConstraints } from '@/helpers/apply-constraints';
import { hasRoles, isAuthenticated } from '@/graphql/composition/authorization';
import { mkdir, readdir, stat, unlink, access, constants } from 'fs/promises';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import path from 'path';
import { PonyfillFile } from '@/types/file';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const resolvers: Resolvers = {
  Query: {
    async infiniteRoutes(_, args, ctx) {
      const query = args.input.query;

      enum PaginationDirection {
        NONE = 'NONE',
        FORWARD = 'FORWARD',
        BACKWARD = 'BACKWARD',
      }

      const direction: PaginationDirection = args.input.after
        ? PaginationDirection.FORWARD
        : args.input.before
          ? PaginationDirection.BACKWARD
          : PaginationDirection.NONE;

      const initialLoading = args.input.initialLoading;

      const take = initialLoading
        ? 5
        : Math.abs(
            applyConstraints({
              type: 'take',
              min: 5,
              max: 50,
              value: args.input.take ?? 30,
            }),
          );

      let cursor =
        direction === PaginationDirection.NONE
          ? undefined
          : { id: args.input.after || args.input.before };

      // in case where we might get cursor which points to nothing
      if (direction !== PaginationDirection.NONE) {
        const cursorOrder = await ctx.prisma.route.findUnique({
          where: { id: cursor?.id },
        });

        if (!cursorOrder) cursor = undefined;
      }

      // Prepare sorting
      const sorting = args.input.sorting || [];

      const orderBy: Prisma.RouteOrderByWithRelationInput[] = sorting.length
        ? sorting.flatMap((sort): Prisma.RouteOrderByWithRelationInput[] => {
            return [{ [sort.id]: sort.desc ? 'desc' : 'asc' }, { id: 'asc' }];
          })
        : [{ updatedAt: 'desc' }, { id: 'asc' }];

      const regionId = args.input.regionId;

      // fetching routes with extra one, so to determine if there's more to fetch
      let routes = await ctx.prisma.route.findMany({
        take:
          direction === PaginationDirection.BACKWARD ? -(take + 1) : take + 1, // Fetch one extra wbOrder for determining `hasNextPage`
        cursor,
        skip: cursor ? 1 : undefined, // Skip the cursor
        orderBy,
        where: {
          OR: [
            {
              arrivalCity: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
            {
              departureCity: {
                name: { contains: query, mode: 'insensitive' },
              },
            },
          ],
          regionId,
        },
      });

      const readFile = async (filePath: string): Promise<Buffer> => {
        const readStream = createReadStream(filePath);
        const chunks: Buffer[] = [];
        const collectChunks = new Writable({
          write(chunk, enc, cb) {
            chunks.push(chunk);
            cb();
          },
        });
        try {
          await pipeline(readStream, collectChunks);
          return Buffer.concat(chunks);
        } catch (error: any) {
          console.error(`Error reading file: ${error.message}`);
          throw new GraphQLError(`Error reading file at path: ${filePath}`);
        }
      };

      routes = await Promise.all(routes.map(async route => {
        const { photoName: fileName } = route;

        if (!fileName) {
          return route;
        }

        const uploadsDir = path.resolve(process.cwd(), 'uploads', 'images');
        const filePath = path.join(uploadsDir, fileName);
        const stats = await stat(filePath);
        const fileType = mime.lookup(filePath) || 'application/octet-stream';
        const buffer = await readFile(filePath);

        return {
          photo: {
            name: fileName,
            blobParts: buffer,
            _size: stats.size,
            type: fileType,
            encoding: 'utf-8',
            lastModified: stats.mtimeMs,
          },
          ...route,
        };
      }));

      if (routes.length === 0) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const edges =
        routes.length <= take
          ? routes
          : direction === PaginationDirection.BACKWARD
            ? routes.slice(1, routes.length)
            : routes.slice(0, -1);

      const hasMore = routes.length > take;

      const startCursor = edges.length === 0 ? null : edges[0]?.id;
      const endCursor = edges.length === 0 ? null : edges.at(-1)?.id;

      const hasNextPage =
        direction === PaginationDirection.BACKWARD ||
        (direction === PaginationDirection.FORWARD && hasMore) ||
        (direction === PaginationDirection.NONE &&
          edges.length < routes.length);

      const hasPreviousPage =
        direction === PaginationDirection.FORWARD ||
        (direction === PaginationDirection.BACKWARD && hasMore);

      return {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage,
          hasPreviousPage,
        },
      };
    },
    async routes(_, { regionId }, ctx) {
      const routes = await ctx.prisma.route.findMany({
        where: {
          regionId,
          isActive: true,
        },
      });

      return routes;
    },
    async routeById(_, args, ctx) {
      const id = args.id;

      if (!id) {
        return null;
      }

      const route = await ctx.prisma.route
        .findUniqueOrThrow({
          where: {
            id,
          },
        })
        .catch((err: unknown) => {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError(
                `Маршрут с таким идентификатором \`${id}\` не найден.`,
              );
            }
          }
          console.log({ err });
          throw new GraphQLError('Unknown error!');
        });

      console.log({ photoName: route.photoName });
      if (route.photoName) {
        const { photoName: fileName } = route;

        const readFile = async (filePath: string): Promise<Buffer> => {
          const readStream = createReadStream(filePath);
          const chunks: Buffer[] = [];
          const collectChunks = new Writable({
            write(chunk, enc, cb) {
              chunks.push(chunk);
              cb();
            },
          });
          try {
            await pipeline(readStream, collectChunks);
            return Buffer.concat(chunks);
          } catch (error: any) {
            console.error(`Error reading file: ${error.message}`);
            throw new GraphQLError(`Error reading file at path: ${filePath}`);
          }
        };

        const uploadsDir = path.resolve(process.cwd(), 'uploads', 'images');
        const filePath = path.join(uploadsDir, fileName);
        const stats = await stat(filePath);
        const fileType = mime.lookup(filePath) || 'application/octet-stream';
        const buffer = await readFile(filePath);

        return {
          photo: {
            name: fileName,
            blobParts: buffer,
            _size: stats.size,
            type: fileType,
            encoding: 'utf-8',
            lastModified: stats.mtimeMs,
          },
          ...route,
        };
      }

      return { ...route, photo: null };
    },
    async routesGallery(_, { limit = 20, offset = 0 }, _ctx) {
      const uploadsDir = path.resolve(process.cwd(), 'uploads', 'images');

      try {
        const dir = await readdir(uploadsDir);

        const totalCount = dir.length;
        const paginatedDir = dir.slice(offset, offset + limit);

        const readFile = async (filePath: string): Promise<Buffer> => {
          const readStream = createReadStream(filePath);
          const chunks: Buffer[] = [];

          const collectChunks = new Writable({
            write(chunk, enc, cb) {
              chunks.push(chunk);
              cb();
            },
          });

          try {
            await pipeline(readStream, collectChunks);
            return Buffer.concat(chunks);
          } catch (error: any) {
            console.error(`Error reading file: ${error.message}`);
            throw new GraphQLError(`Error reading file at path: ${filePath}`);
          }
        };

        const images = await Promise.all(
          paginatedDir.map(async fileName => {
            const filePath = path.join(uploadsDir, fileName);
            const stats = await stat(filePath);
            const fileType =
              mime.lookup(filePath) || 'application/octet-stream';
            const buffer = await readFile(filePath);

            return {
              name: fileName,
              blobParts: buffer,
              _size: stats.size,
              type: fileType,
              encoding: 'utf-8',
              lastModified: stats.mtimeMs,
            } as PonyfillFile;
          }),
        );

        return { images, totalCount };
      } catch (error: any) {
        console.error(`Error reading gallery: ${error.message}`);
        throw new GraphQLError(`Не удалось прочитать файлы`);
      }
    },
  },
  Mutation: {
    async uploadPhotoRoute(_, args, ctx) {
      const file: PonyfillFile = args.file;
      const isPhotoSelected = args.isPhotoSelected ?? false;
      const routeId = args.routeId;

      const route = await ctx.prisma.route.findUniqueOrThrow({
        where: {
          id: routeId,
        },
        select: {
          region: true,
        },
      });

      const hashFileName = async (fileName: string) => {
        try {
          const { randomBytes } = await import('crypto');
          const hash = randomBytes(16).toString('hex');

          const extension = path.extname(fileName);
          const basename = path.basename(fileName, path.extname(fileName));

          return `${basename}-${hash}${extension}`;
        } catch (err) {
          console.error('Failed to generate file name:', err);
          throw new GraphQLError('Failed to process file name');
        }
      };

      const fileName = isPhotoSelected
        ? file.name
        : await hashFileName(file.name);

      const uploadDir = path.resolve(process.cwd(), 'uploads', 'images');

      const filePath = path.join(uploadDir, fileName);

      try {
        await access(uploadDir, constants.F_OK);
        console.log('👽 Folder is already exists. Do nothing.');
      } catch (error: any) {
        // Directory doesn't exist, create it
        try {
          await mkdir(uploadDir, { recursive: true });
        } catch (error: any) {
          console.error('Failed to create upload directory: ', error.message);
          throw new GraphQLError('Failed to prepare upload directory');
        }
      }

      if (isPhotoSelected) {
        try {
          // File exists, safe
          await access(filePath, constants.F_OK);

          try {
            const stats = await stat(filePath);
            const fileType =
              mime.lookup(filePath) || 'application/octet-stream';

            await ctx.prisma.route.update({
              where: {
                id: routeId,
              },
              data: {
                photoName: fileName,
              },
            });

            return {
              routeId,
              regionId: route.region?.id,
              photo: {
                name: fileName,
                _size: stats.size,
                type: fileType,
                encoding: 'utf-8',
                lastModified: stats.mtimeMs,
              } as PonyfillFile,
            };
          } catch (error) {
            console.error('Failed to process existing file:', error);
            throw new GraphQLError('Failed to process the selected file');
          }
        } catch (error) {
          // File doesn't exist
          throw new GraphQLError('Selected file not found');
        }
      }

      // Check if file already exists before writing
      try {
        await access(filePath, constants.F_OK);
        // File already exists
        throw new GraphQLError(`File already exists at ${filePath}`);
      } catch (accessErr) {
        // File doesn't exist, safe to write
        const fileStream = createWriteStream(filePath);

        try {
          // const buffer = Buffer.from(await file.arrayBuffer());
          // await pipeline([buffer], fileStream);
          await pipeline(file.blobParts, fileStream);

          await ctx.prisma.route.update({
            where: {
              id: routeId,
            },
            data: {
              photoName: fileName,
            },
          });

          return {
            photo: {
              ...file,
              name: fileName,
            },
            routeId,
            regionId: route.region?.id,
          };
        } catch (error) {
          console.error('File upload failed:', error);
          // Clean up partially written file
          try {
            await access(filePath, constants.F_OK);
            // If file exists, delete it
            await unlink(filePath);
          } catch (unlinkError) {
            console.error(
              'Failed to clean up or file does not exist:',
              unlinkError,
            );
          }
          throw new GraphQLError(`Не удалось загрузить файл ${fileName}`);
        }
      }
    },
    async createRoute(_, args, ctx) {
      const {
        arrivalCityId,
        departureCityId,
        regionId,
        isActive,
        departureDate,
        price,
      } = args.input;

      const route = await ctx.prisma.route
        .create({
          data: {
            arrivalCityId,
            departureCityId,
            regionId,
            isActive,
            departureDate,
            price,
          },
        })
        .catch(error => {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new GraphQLError(
                `Маршрут с таким отправлением уже существует.`,
              );
            }
          }
          console.log({ error });
          throw new GraphQLError('Unknown error!');
        });

      return route;
    },
    async updateRoute(_, args, ctx) {
      const routeId = args.id;
      const {
        departureCityId,
        isActive,
        departureDate,
        arrivalCityId,
        regionId,
        price,
      } = args.input;

      const updatedRoute = ctx.prisma.route
        .update({
          where: {
            id: routeId,
          },
          data: {
            departureCityId,
            isActive,
            departureDate,
            arrivalCityId,
            regionId,
            price,
          },
        })
        .catch(error => {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new GraphQLError(
                `Маршрут с таким отправлением уже существует.`,
              );
            }
          }
          console.log({ error });
          throw new GraphQLError('Unknown error!');
        });

      return updatedRoute;
    },
  },
  Route: {
    region(parent, _, { loaders }) {
      return parent.regionId
        ? loaders.regionLoader.load(parent.regionId)
        : null;
    },
    arrivalCity(parent, _, { loaders }) {
      return loaders.cityLoader.load(parent.arrivalCityId);
    },
    departureCity(parent, _, { loaders }) {
      return loaders.cityLoader.load(parent.departureCityId);
    },
    bookings(parent, _, { loaders }) {
      return loaders.bookingsLoader.load(parent.id);
    },
    schedules(parent, _, { loaders }) {
      return loaders.schedulesLoader.load(parent.id);
    },
  },
};

const resolversComposition: ResolversComposerMapping<any> = {
  'Query.routeById': [isAuthenticated(), hasRoles([Role.MANAGER, Role.ADMIN])],
  // 'Query.infiniteRoutes': [
  //   isAuthenticated(),
  //   hasRoles([Role.MANAGER, Role.ADMIN]),
  // ],
  'Mutation.uploadPhotoRoute': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
  'Mutation.createRoute': [
    isAuthenticated(),
    hasRoles([Role.MANAGER, Role.ADMIN]),
  ],
};

export default composeResolvers(resolvers, resolversComposition);
