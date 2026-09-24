export function TopMarquee() {
  const words = ["tell me your secret", "rate me honestly", "who should I date?", "describe me in 3 words", "confess something", "ask me anything", "drop your hottest take", "truth or dare"];
  return <div className="top-marquee" aria-label="SEKRETLY interaction prompts"><div className="top-marquee__track">{[...words, ...words].map((word, index) => <span key={`${word}-${index}`}>{word} <b>•</b></span>)}</div></div>;
}
