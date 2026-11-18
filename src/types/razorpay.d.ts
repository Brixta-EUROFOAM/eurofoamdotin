interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  handler: (result: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayCheckout {
  open(): void;
  on(event: "payment.failed", callback: (response: { error?: { description?: string } }) => void): void;
}
interface Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
}
