import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Text capitalization utilities
export function capitalizeFirst(text) {
  if (!text || typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function capitalizeWords(text) {
  if (!text || typeof text !== 'string') return text;
  return text.split(' ').map(word => 
    word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
  ).join(' ');
}

export function capitalizeSentence(text) {
  if (!text || typeof text !== 'string') return text;
  return text.split('.').map(sentence => 
    sentence.trim() ? sentence.trim().charAt(0).toUpperCase() + sentence.trim().slice(1) : sentence
  ).join('.');
}