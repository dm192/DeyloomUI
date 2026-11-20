import * as React from "react";
import { cn } from "../../../lib/cn";
import { useDeyloomReducedMotion } from "../../../hooks";

export interface NumberFlowProps {
  /** Current numeric value. Only digits whose slot changed animate. */
  value: number;
  /** `Intl.NumberFormat` options, e.g. `{ style: "currency", currency: "CNY" }`. */
  format?: Intl.NumberFormatOptions;
  /** BCP-47 locale. Defaults to the runtime locale. */
  locale?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

interface DigitToken {
  key: string;
  char: string;
  /** 0鈥? when the character is an ASCII digit, `null` for symbols/separators. */
  digit: number | null;
}

function isAsciiDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

/**
 * Split the formatted string into stable positions. Digits are keyed from the
 * right so 99 鈫?100 keeps the existing slots and prepends one, instead of making
 * every position look new. Symbols (separators, currency signs, minus) are
 * static and never animate.
 */
function buildTokens(formatted: string): DigitToken[] {
  const chars = Array.from(formatted);
  let digitCount = 0;
  for (const char of chars) {
    if (isAsciiDigit(char)) digitCount += 1;
  }

  let digitOrdinal = 0;
  return chars.map((char, index) => {
    if (!isAsciiDigit(char)) {
      return { key: `c${index}-${char}`, char, digit: null };
    }
    const fromRight = digitCount - 1 - digitOrdinal;
    digitOrdinal += 1;
    return { key: `d${fromRight}`, char, digit: char.charCodeAt(0) - 48 };
  });
}

/**
 * Digit-slot number display. The visual text is `aria-hidden` on purpose: a
 * screen reader gets one `aria-label` with the finished value instead of a
 * digit-by-digit stream. Under reduced motion the slots are not rendered at all.
 */
export function NumberFlow(props: NumberFlowProps) {
  const { value, format, locale, prefix, suffix, className } = props;
  const reducedMotion = useDeyloomReducedMotion();

  const formatted = React.useMemo(
    () => new Intl.NumberFormat(locale, format).format(value),
    [value, locale, format],
  );
  const tokens = React.useMemo(() => buildTokens(formatted), [formatted]);
  const accessibleValue = `${prefix ?? ""}${formatted}${suffix ?? ""}`;

  if (reducedMotion) {
    return (
      <span className={cn("dl-number-flow", className)} role="img" aria-label={accessibleValue} data-motion="static">
        <span className="dl-number-flow__visual" aria-hidden="true">
          {accessibleValue}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("dl-number-flow", className)} role="img" aria-label={accessibleValue} data-motion="animated">
      <span className="dl-number-flow__visual" aria-hidden="true">
        {prefix ? <span className="dl-number-flow__affix">{prefix}</span> : null}
        {tokens.map((token) =>
          token.digit === null ? (
            <span key={token.key} className="dl-number-flow__static">
              {token.char}
            </span>
          ) : (
            <span key={token.key} className="dl-number-flow__slot">
              <span
                className="dl-number-flow__strip"
                style={{ transform: `translateY(-${token.digit * 10}%)` }}
              >
                {DIGITS.map((digit) => (
                  <span key={digit} className="dl-number-flow__digit">
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          ),
        )}
        {suffix ? <span className="dl-number-flow__affix">{suffix}</span> : null}
      </span>
    </span>
  );
}
