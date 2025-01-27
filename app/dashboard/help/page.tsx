"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileIcon,
  FolderIcon,
  LifeBuoyIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
} from "lucide-react";

const faqs = [
  {
    question: "Comment puis-je partager un fichier ?",
    answer:
      "Pour partager un fichier, accédez à la section Fichiers, sélectionnez le fichier souhaité et cliquez sur l'icône de partage. Vous pourrez ensuite choisir les utilisateurs avec qui partager le fichier et définir leurs permissions.",
  },
  {
    question: "Comment gérer les permissions des utilisateurs ?",
    answer:
      "Dans la section Utilisateurs, vous pouvez attribuer différents rôles (Administrateur, Éditeur, Lecteur) à chaque utilisateur. Chaque rôle a des permissions spécifiques qui déterminent ce que l'utilisateur peut faire dans l'application.",
  },
  {
    question: "Comment créer un nouveau dossier ?",
    answer:
      "Dans la section Fichiers, cliquez sur le bouton 'Nouveau Dossier' en haut à droite. Donnez un nom à votre dossier et il sera créé dans l'emplacement actuel.",
  },
  {
    question: "Comment suivre l'activité de mon équipe ?",
    answer:
      "La section Activité vous montre un historique détaillé de toutes les actions effectuées par les membres de votre équipe, comme les téléchargements, les modifications et les partages de fichiers.",
  },
  {
    question: "Comment restaurer un fichier supprimé ?",
    answer:
      "Les fichiers supprimés sont conservés dans la corbeille pendant 30 jours. Pour restaurer un fichier, accédez à la corbeille, trouvez le fichier et cliquez sur 'Restaurer'.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Centre d'aide</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5 text-primary" />
              <CardTitle>Chat en direct</CardTitle>
            </div>
            <CardDescription>
              Discutez avec notre équipe de support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Démarrer une conversation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MailIcon className="h-5 w-5 text-primary" />
              <CardTitle>Email</CardTitle>
            </div>
            <CardDescription>Envoyez-nous un message</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              support@example.com
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-5 w-5 text-primary" />
              <CardTitle>Téléphone</CardTitle>
            </div>
            <CardDescription>Appelez notre équipe de support</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              +221 778417586
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LifeBuoyIcon className="h-5 w-5 text-primary" />
            <CardTitle>Questions fréquentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input placeholder="Rechercher dans l'aide..." />
              <Button>Rechercher</Button>
            </div>
            <Separator />
            <ScrollArea className="h-[400px] pr-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guides rapides</CardTitle>
          <CardDescription>
            Apprenez à utiliser les fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-20 justify-start gap-4">
              <FileIcon className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Gestion des fichiers</p>
                <p className="text-sm text-muted-foreground">
                  Apprenez à gérer vos fichiers efficacement
                </p>
              </div>
            </Button>
            <Button variant="outline" className="h-20 justify-start gap-4">
              <FolderIcon className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Organisation des dossiers</p>
                <p className="text-sm text-muted-foreground">
                  Optimisez votre structure de dossiers
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
