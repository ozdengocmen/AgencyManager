import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { getDefaultCredentials, useAppState, type AppLanguage } from "../../state";
import type { UserRole } from "../../api/types";
import { toast } from "sonner";
import { useI18n } from "../../i18n";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAppState();
  const { copy, language: appLanguage } = useI18n();
  const [role, setRole] = useState<UserRole>("salesperson");
  const [language, setLanguage] = useState<AppLanguage>(appLanguage);
  const defaults = useMemo(() => getDefaultCredentials(role), [role]);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState(defaults.password);
  const [portfolioScope, setPortfolioScope] = useState("john-smith");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLanguage(appLanguage);
  }, [appLanguage]);

  const updateRole = (value: UserRole) => {
    setRole(value);
    const nextDefaults = getDefaultCredentials(value);
    setEmail(nextDefaults.email);
    setPassword(nextDefaults.password);
    setPortfolioScope(value === "manager" ? "all" : "john-smith");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login({
      email,
      password,
      role,
      language,
      portfolioScope,
    });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(copy.login.signInSuccess);
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{copy.login.title}</CardTitle>
          <CardDescription>{copy.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{copy.login.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{copy.login.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{copy.login.role}</Label>
              <Select value={role} onValueChange={(value) => updateRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesperson">{copy.login.salesperson}</SelectItem>
                  <SelectItem value="manager">{copy.login.manager}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio">{copy.login.portfolioFilter}</Label>
              <Select value={portfolioScope} onValueChange={setPortfolioScope}>
                <SelectTrigger id="portfolio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-smith">{copy.login.portfolioOwner}</SelectItem>
                  <SelectItem value="new-york">{copy.login.portfolioRegion}</SelectItem>
                  <SelectItem value="all">{copy.login.portfolioAll}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{copy.login.language}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as AppLanguage)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{copy.login.english}</SelectItem>
                  <SelectItem value="tr">{copy.login.turkish}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full">
              {isSubmitting ? copy.login.signingIn : copy.login.signIn}
            </Button>
            <p className="text-xs text-slate-500">
              {copy.login.defaultsPrefix}: {defaults.email} / {defaults.password}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
