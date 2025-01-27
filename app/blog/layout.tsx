import { TopAuthors } from "@/components/TopAuthors";
import { Header } from "@/components/layout/header";
import { ResizablePanelGroup, ResizablePanel } from "@/components/ui/resizable";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ResizablePanelGroup
        direction="horizontal"
        className="sticky top-20 left-0 bottom-0 max-h-screen"
      >
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="sticky top-0 h-[calc(100vh-4rem)] p-4 border-r overflow-auto">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Categories</h2>
              <nav className="space-y-2">
                <a
                  href="#"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  # Education
                </a>
                <a
                  href="#"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  # Design
                </a>
                <a
                  href="#"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  # Développement
                </a>
                <a
                  href="#"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  # Resources
                </a>
              </nav>

              <div className="pt-4">
                <h2 className="text-lg font-semibold mb-4">Tags populaires</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    #gouv
                  </div>
                  <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    #ministere
                  </div>
                  <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    #pmn
                  </div>
                  <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                    #education
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-lg font-semibold mb-4">
                  Top Contributeurs
                </h2>
                <div className="space-y-3">
                  <TopAuthors />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizablePanel defaultSize={80}>
          <div className="h-full overflow-auto">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
