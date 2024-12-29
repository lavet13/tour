import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';

function SettingsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Настройки аккаунта</PageHeaderHeading>
        <PageHeaderDescription>Можете настроить ваш аватар, уведомления и прочее</PageHeaderDescription>
      </PageHeader>
      <div className="container py-4">
      </div>
    </>
  );
}

export default SettingsPage;
