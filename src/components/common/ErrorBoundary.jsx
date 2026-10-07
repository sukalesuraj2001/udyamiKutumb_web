import React from "react";

/**
 * Catches render / effect errors in the subtree so one broken widget (e.g. a
 * map fed with bad GeoJSON) shows a message instead of blanking the whole app.
 *
 * Props:
 *   label    - short name used in the message ("Member map")
 *   resetKey - when this value changes the boundary clears its error state
 *   onReset  - optional callback for the "Try again" button
 *   className - classes for the fallback wrapper
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const message = (error && (error.message || String(error))) || "Unknown error";

    return (
      <div
        className={
          this.props.className ||
          "flex flex-col items-center justify-center gap-2 p-6 text-center bg-white border border-red-200 rounded-xl"
        }
      >
        <p className="text-[13px] font-semibold text-red-600">
          {this.props.label ? `${this.props.label} could not be displayed` : "Something went wrong"}
        </p>
        <p className="text-[11.5px] text-gray-500 max-w-md break-words">{message}</p>
        <button
          type="button"
          onClick={this.handleReset}
          className="mt-1 h-8 px-3 text-[12px] font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700"
        >
          Try again
        </button>
      </div>
    );
  }
}
