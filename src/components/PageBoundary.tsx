import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { t } from "../lib/prefs";
import { Button, Card } from "./ui";

/*
  Catches a page that fails to load (for example a section whose data is not
  available on the server yet) so the user stays signed in and the rest of the
  panel keeps working.
*/
export class PageBoundary extends Component<{ children: ReactNode; resetKey: string }, { failedKey: string | null }> {
  state = { failedKey: null as string | null };
  static getDerivedStateFromError() {
    return { failedKey: "" };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
    this.setState({ failedKey: this.props.resetKey });
  }
  render() {
    const failed = this.state.failedKey !== null && this.state.failedKey === this.props.resetKey;
    if (!failed) return this.props.children;
    return (
      <Card className="mx-auto mt-10 max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto size-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-bold">{t("This section is not available yet")}</h2>
        <p className="mt-1 text-sm text-ink-2">{t("You are still signed in. Choose another section from the menu.")}</p>
        <Button className="mt-5" variant="outline" onClick={() => this.setState({ failedKey: null })}>
          {t("Try again")}
        </Button>
      </Card>
    );
  }
}
