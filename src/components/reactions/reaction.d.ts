import {type Timestamp, type FieldValue} from 'firebase/firestore';

export type IconReaction = 'love' | 'smile' | 'applause' | 'explode';
export type ConfettiReaction = 'confetti';
export type ClearReaction = 'clear';
export type ReactionType = IconReaction | ConfettiReaction | ClearReaction;
export type ReactionEntry = [string, ReactionType];
export type IconReactionEntry = [string, RenderedReaction];
export type IconReactionMap = Map<string, RenderedReaction>;
export type ConfettiReactionEntry = [string, ConfettiReaction];

type CommonReactionData = {
  reaction: ReactionType;
  ttl: Date;
};

type RenderedReaction = {
  done?: boolean;
  reaction: IconReaction;
};

export type IncomingReactionData = CommonReactionData & {
  created: Timestamp;
};

export type OutgoingReactionData = CommonReactionData & {
  created: FieldValue;
};

export type ReactionData = IncomingReactionData | OutgoingReactionData;
