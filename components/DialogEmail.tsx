import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface DialogEmailProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onSendEmail: (email: string) => Promise<any>;
  fileName: string;
}

const DialogEmail = ({
  isOpen,
  setIsOpen,
  onSendEmail,
  fileName,
}: DialogEmailProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      setIsLoading(true);
      const response = await onSendEmail(email);
      if (response.success) {
        setEmail("");
        setIsOpen(false);
        toast.success(`Fichier envoyé avec succès à ${email}`, {
          style: {
            color: "#22c55e",
            background: "#27272A",
          },
        });
      }else{
        toast.error("Quelque chose s'est mal passée, veuillez réessayer plus tard", {
            style: {
              color: "#ef4444",
              background: "#27272A",
            },
          });
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Partager par email</DialogTitle>
            <DialogDescription>
              Envoyez le fichier "{fileName}" à l'adresse email de votre choix.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={error ? "border-red-500" : ""}
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!email || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEmail;
