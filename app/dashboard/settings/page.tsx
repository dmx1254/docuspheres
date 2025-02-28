"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { BellIcon, GlobeIcon, LockIcon, UserIcon } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isPasswordChanging, setIsPasswordChanging] = useState<boolean>(false);
  const [infoLoading, setInfoLoading] = useState<boolean>(false);

  const HandleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("Les mots de passe ne correspondent pas", {
        style: {
          color: "#dc2626",
        },
      });
    } else {
      try {
        setIsPasswordChanging(true);
        const res = await fetch(
          `/api/users/${session?.user.id}/change-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newPassword }),
          }
        );

        if (res.ok) {
          toast.success("Mot de passe mis à jour avec succès", {
            style: {
              color: "#16a34a",
            },
          });
        } else {
          toast.error("Une erreur est survenue", {
            style: {
              color: "#dc2626",
            },
          });
        }

        // console.log(data);
        // console.log(res);
      } catch (error) {
        console.log(error);
      } finally {
        setIsPasswordChanging(false);
      }
    }
  };

  const hanleUpdateUserInformation = async () => {
    try {
      const data = {
        email,
        name,
      };
      if (!data) {
        toast.error("Veuiller remplir au moins un champs", {
          style: {
            color: "#dc2626",
          },
        });
      } else {
        setInfoLoading(true);
        const res = await fetch(`/api/users/${session?.user.id}/change-info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          toast.success("Vos informations ont été mises à jour avec succès", {
            style: {
              color: "#16a34a",
            },
          });
        } else {
          toast.error("Une erreur est survenue", {
            style: {
              color: "#dc2626",
            },
          });
        }
      }
    } catch (error) {
    } finally {
      setInfoLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <CardTitle>Profil</CardTitle>
            </div>
            <CardDescription>
              Gérez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                placeholder="Votre nom complet"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>
            <Button
              disabled={!name.trim() && !email.trim()}
              onClick={hanleUpdateUserInformation}
              style={{
                opacity: !name.trim() && !email.trim() ? 0.5 : 1,
              }}
            >
              {infoLoading ? "En cours..." : "Sauvegarder"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Notifications par email</Label>
              <Switch id="email-notif" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notif">Notifications push</Label>
              <Switch id="push-notif" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activity-notif">Résumé d'activité</Label>
              <Switch id="activity-notif" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5 text-primary" />
              <CardTitle>Préférences</CardTitle>
            </div>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select defaultValue="fr">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select defaultValue="europe-paris">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe-paris">Europe/Paris</SelectItem>
                  <SelectItem value="america-new_york">
                    America/New York
                  </SelectItem>
                  <SelectItem value="asia-tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockIcon className="h-5 w-5 text-primary" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>Gérez la sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input
                id="current-password"
                type="password"
                value={newPassword}
                placeholder="********"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={confirmNewPassword}
                placeholder="********"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmNewPassword(e.target.value)
                }
              />
            </div>
            <Button onClick={HandleChangePassword}>
              {isPasswordChanging ? "En cours..." : "Changer le mot de passe"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
