import {type Timestamp, type FieldValue} from 'firebase/firestore';

export type IconReaction = 'love' | 'smile' | 'applause' | 'explode';
export type ConfettiReaction = 'confetti' | 'confetti clear';
export type ReactionType = IconReaction | ConfettiReaction;
export type ReactionEntry = [string, ReactionType];
export type IconReactionEntry = [string, IconReaction];
export type IconReactionMap = Map<string, IconReaction>;

type CommonReactionData = {
  reaction: ReactionType;
  ttl: Date;
};

export type IncomingReactionData = CommonReactionData & {
  created: Timestamp;
};

export type OutgoingReactionData = CommonReactionData & {
  created: FieldValue;
};

export type ReactionData = IncomingReactionData | OutgoingReactionData;
