import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  multiline = false,
  onKeyDown,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Buscar usuários para sugestões
  const { data: suggestions = [] } = useQuery({
    queryKey: ["mention-users", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 1) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .ilike("name", `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: showSuggestions && searchTerm.length >= 1,
  });

  // Detectar quando usuário digita @
  const handleChange = useCallback(
    (newValue: string, cursorPos: number) => {
      onChange(newValue);
      setCursorPosition(cursorPos);

      // Verificar se estamos digitando uma menção
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Verificar se não há espaço entre @ e cursor
        if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
          setSearchTerm(textAfterAt);
          setShowSuggestions(true);
          setSelectedIndex(0);
          return;
        }
      }

      setShowSuggestions(false);
      setSearchTerm("");
    },
    [onChange]
  );

  // Inserir menção selecionada
  const insertMention = useCallback(
    (user: Profile) => {
      const textBeforeCursor = value.slice(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");
      const textAfterCursor = value.slice(cursorPosition);

      const newValue =
        value.slice(0, lastAtIndex) + `@${user.name} ` + textAfterCursor;

      onChange(newValue);
      setShowSuggestions(false);
      setSearchTerm("");

      // Focar de volta no input
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = lastAtIndex + user.name.length + 2;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [value, cursorPosition, onChange]
  );

  // Navegação com teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? suggestions.length - 1 : prev - 1
          );
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
          return;
        }
        if (e.key === "Escape") {
          setShowSuggestions(false);
          return;
        }
      }
      onKeyDown?.(e);
    },
    [showSuggestions, suggestions, selectedIndex, insertMention, onKeyDown]
  );

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commonProps = {
    value,
    placeholder,
    className,
    onKeyDown: handleKeyDown,
  };

  return (
    <div className="relative">
      {multiline ? (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...commonProps}
          onChange={(e) => {
            handleChange(e.target.value, e.target.selectionStart || 0);
          }}
          onSelect={(e) => {
            setCursorPosition(e.currentTarget.selectionStart || 0);
          }}
        />
      ) : (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          {...commonProps}
          onChange={(e) => {
            handleChange(e.target.value, e.target.selectionStart || 0);
          }}
          onSelect={(e) => {
            setCursorPosition(e.currentTarget.selectionStart || 0);
          }}
        />
      )}

      {/* Dropdown de sugestões */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-w-xs rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                index === selectedIndex
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
