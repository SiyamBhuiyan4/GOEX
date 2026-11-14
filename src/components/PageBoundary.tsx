import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { t } from "../lib/prefs";
import { Button, Card } from "./ui";

/*
  Catches a page that fails to load (for example a section whose data is not
  available on the server yet) so the user stays signed in and the rest of the
  panel keeps working. Clears itself when the user opens another page.
*/
type Props = { children: ReactNode; resetKey: string };
type State = { failed: boolean; key: string };

export class PageBoundary extends Component<Props, State> {
  state: State = { failed: false, key: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null;
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Card className="mx-auto mt-10 max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto size-10 text-amber-500" />
        <h2 className="mt-4 text-lg font-bold">{t("This section is not available yet")}</h2>
        <p className="mt-1 text-sm text-ink-2">{t("You are still signed in. Choose another section from the menu.")}</p>
        <Button className="mt-5" variant="outline" onClick={() => this.setState({ failed: false })}>
          {t("Try again")}
        </Button>
      </Card>
    );
  }
}
