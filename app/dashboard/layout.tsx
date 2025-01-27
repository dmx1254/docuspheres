import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel
          defaultSize={15}
          minSize={15}
          maxSize={20}
          className="hidden md:block"
        >
          <Sidebar />
        </ResizablePanel>
        <ResizablePanel defaultSize={85}>
          <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 ml-6 overflow-auto">{children}</div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
