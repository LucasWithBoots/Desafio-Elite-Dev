import "ldrs/ring";
import { tailspin } from "ldrs";
tailspin.register();

export function LoadingState() {
  return (
    <div className="loading-spinner">
      <l-tailspin size="40" stroke="5" speed="0.9" color="#ef7be8"></l-tailspin>
    </div>
  );
}
