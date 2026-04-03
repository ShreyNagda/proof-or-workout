const steps = [
  {
    step: "01",
    icon: "🦊",
    title: "Connect",
    desc: "Link MetaMask on Sepolia testnet",
  },
  {
    step: "02",
    icon: "📸",
    title: "Upload",
    desc: "Screenshot from Google Fit or Apple Health",
  },
  {
    step: "03",
    icon: "⛓️",
    title: "Earn",
    desc: "OCR extracts steps, proof goes on-chain",
  },
];

export default function HowItWorks() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
      {steps.map((item) => (
        <div
          key={item.step}
          className="rounded-xl p-4 space-y-2 bg-pow-card border border-pow-border"
        >
          <p className="text-xs text-pow-accent font-mono">{item.step}</p>
          <p className="text-2xl">{item.icon}</p>
          <p className="font-semibold text-sm text-pow-text">{item.title}</p>
          <p className="text-xs text-pow-muted">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}
