import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-8xl">🦆❓</div>
        <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">This duck got lost in the pond!</p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/">Back to Racing</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
