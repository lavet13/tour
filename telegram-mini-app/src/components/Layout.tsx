import { isGraphQLRequestError } from "@/react-query/types/is-graphql-request-error";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Button, Tabbar } from "@telegram-apps/telegram-ui";
import { BusIcon, MessageCircleQuestionMark } from "lucide-react";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

const tabs = [
  { id: "/booking", text: "Маршрут", Icon: BusIcon },
  { id: "/question", text: "Вопрос", Icon: MessageCircleQuestionMark },
];

const Layout: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const errorLocation = useRef(location.pathname);
  const [currentTab, setCurrentTab] = useState("/");

  // Syncing with pathname
  if (currentTab !== location.pathname) {
    setCurrentTab(location.pathname);
  }

  return (
    <Fragment>
      <Tabbar className="z-[50]">
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={text}
            selected={id === currentTab}
            onClick={() => {
              setCurrentTab(id);
              navigate(id);
            }}
          >
            <Icon />
          </Tabbar.Item>
        ))}
      </Tabbar>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={({ error, resetErrorBoundary }) => {
              useEffect(() => {
                if (location.pathname !== errorLocation.current) {
                  resetErrorBoundary();
                }
              }, [location.pathname]);

              const errorMessage = isGraphQLRequestError(error)
                ? error.response.errors[0].message
                : error.message;

              return (
                <div className="flex justify-center items-center grow">
                  <div className="container max-w-[600px]">
                    <div className="flex flex-col justify-center">
                      Ошибка
                      {errorMessage}
                      <div className="flex">
                        <Button
                          className="sm:ml-auto flex-1 sm:flex-none"
                          mode="white"
                          onClick={() => resetErrorBoundary()}
                        >
                          Повторить запрос
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
            onReset={reset}
          >
            <Outlet />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </Fragment>
  );
};

export default Layout;
