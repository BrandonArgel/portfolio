import { JSX } from 'react';
import { TypewriterProps, useTypewriter } from '@hooks/useTypewriter';
import { Cursor, CursorProps } from './Cursor';

type ComponentProps = {
  /** Show / Hide the cursor */
  cursor?: boolean;
} & TypewriterProps &
  CursorProps;

/**
 * A Simple React Component for adding a nice Typewriter effect to your project.
 */
export const Typewriter = ({
  words = [],
  loop = 0,
  typeSpeed = 80,
  deleteSpeed = 50,
  delaySpeed = 1500,
  cursor = true,
  cursorStyle = '|',
  cursorColor = 'inherit',
  cursorBlinking = true,
  onLoopDone,
  onType,
  onDelay,
  onDelete,
}: ComponentProps): JSX.Element => {
  const [text, { isTyping, isDelay, isDelete, isDone }] = useTypewriter({
    words,
    loop,
    typeSpeed,
    deleteSpeed,
    delaySpeed,
    onLoopDone,
    onType,
    onDelay,
    onDelete,
  });

  const isBlinking = cursorBlinking && (!isTyping && !isDelete) || (isDone && isDelay);

  return (
    <>
      <span>{text}</span>
      {cursor && (
        <Cursor
          cursorStyle={cursorStyle}
          cursorColor={cursorColor}
          cursorBlinking={isBlinking}
        />
      )}
    </>
  );
};
