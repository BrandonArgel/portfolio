import { useCallback, useEffect, useRef } from 'react';
import { useTypeWriterStore } from '@stores/typeWriter';

export type TypewriterProps = {
  /** Callback Function that is triggered when loops are completed. available if loop is > `0` */
  onLoopDone?: () => void;
  /** Callback Function that is triggered while typing with `typed` words count passed */
  onType?: (count: number) => void;
  /** Callback Function that is triggered while deleting */
  onDelete?: () => void;
  /** Callback Function that is triggered on typing delay */
  onDelay?: () => void;
  /** Array of strings holding the words */
  words: string[];
  /** Control how many times to run. `0 | false` to run infinitely */
  loop?: number | boolean;
  /** Character typing speed in Milliseconds */
  typeSpeed?: number;
  /** Character deleting speed in Milliseconds */
  deleteSpeed?: number;
  /** Delay time between the words in Milliseconds */
  delaySpeed?: number;
};

export type TypewriterHelper = {
  /** `true` if currently typing */
  isTyping: boolean;
  /** `true` if on delay */
  isDelay: boolean;
  /** `true` if currently deleting */
  isDelete: boolean;
  /** `true` if all loops are done */
  isDone: boolean;
};

export const useTypewriter = ({
  words = [],
  loop = 1,
  typeSpeed = 80,
  deleteSpeed = 50,
  delaySpeed = 1500,
  onLoopDone,
  onType,
  onDelete,
  onDelay,
}: TypewriterProps): [string, TypewriterHelper] => {
  // Zustand store state
  const { speed, text, count, setSpeed, setText, incrementCount } =
    useTypeWriterStore();

  // Refs for loop and states
  const loops = useRef(0);
  const isDone = useRef(false);
  const isDelete = useRef(false);
  const isTyping = useRef(false);
  const isDelay = useRef(false);

  const handleTyping = useCallback(() => {
    const index = count % words.length;
    const fullWord = words[index];

    if (!isDelete.current) {
      setText(fullWord.substring(0, text.length + 1));
      setSpeed(typeSpeed);
      isTyping.current = true;

      if (text === fullWord) {
        setSpeed(delaySpeed);
        isTyping.current = false;
        isDelay.current = true;

        setTimeout(() => {
          isDelay.current = false;
          isDelete.current = true;
        }, delaySpeed);

        if (typeof loop === 'number' && loop > 0) {
          loops.current += 1;
          if (loops.current / words.length === loop) {
            isDelay.current = false;
            isDone.current = true;
          }
        }
      }
    } else {
      setText(fullWord.substring(0, text.length - 1));
      setSpeed(deleteSpeed);
      if (text === '') {
        isDelete.current = false;
        incrementCount();
      }
    }

    if (isTyping.current) {
      if (onType) onType(loops.current);
    }

    if (isDelete.current) {
      if (onDelete) onDelete();
    }

    if (isDelay.current) {
      if (onDelay) onDelay();
    }
  }, [
    count,
    delaySpeed,
    deleteSpeed,
    loop,
    typeSpeed,
    words,
    text,
    setText,
    setSpeed,
    incrementCount,
    onType,
    onDelete,
    onDelay,
  ]);

  useEffect(() => {
    const typing = setTimeout(handleTyping, speed);

    if (isDone.current) clearTimeout(typing);

    return () => clearTimeout(typing);
  }, [handleTyping, speed]);

  useEffect(() => {
    if (!onLoopDone) return;

    if (isDone.current) {
      onLoopDone();
    }
  }, [onLoopDone]);

  return [
    text,
    {
      isTyping: isTyping.current,
      isDelay: isDelay.current,
      isDelete: isDelete.current,
      isDone: isDone.current,
    },
  ];
};
