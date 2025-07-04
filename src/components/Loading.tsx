import Message from './Message';

export default function Loading({message}: {readonly message?: string}) {
  return (
    <Message>
      <div className="i-tabler-loader-3 w-10 h-10 animate-spin" />
      {message ? <div>{message}</div> : null}
    </Message>
  );
}
