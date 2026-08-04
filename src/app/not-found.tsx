import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Страница не найдена</p>
        <Link href="/dashboard/tasks">
          <Button>Вернуться к задачам</Button>
        </Link>
      </div>
    </div>
  );
}
