import { cn } from "@/lib/utils";

interface MentionTextProps {
  content: string;
  className?: string;
}

export function MentionText({ content, className }: MentionTextProps) {
  // Regex para encontrar menções @username
  const mentionRegex = /@(\w+)/g;
  
  // Dividir o texto em partes
  const parts: { type: "text" | "mention"; value: string }[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    // Adicionar texto antes da menção
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }
    
    // Adicionar a menção
    parts.push({
      type: "mention",
      value: match[0],
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Adicionar texto restante
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }
  
  // Se não houver menções, retornar texto simples
  if (parts.length === 0) {
    return <span className={className}>{content}</span>;
  }
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <span
              key={index}
              className="text-primary font-medium hover:underline cursor-pointer"
            >
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </span>
  );
}
