'use client';

import { cloneElement, isValidElement, type ReactElement } from 'react';
import { ATTR_PREFIX } from './constants';

type TrackGoalProps = {
  /** The type of tracking to perform */
  type: 'goal';
  /** Goal name — fires a custom event on click/keypress. */
  name: string;
  /** Optional key-value data attached to the goal event. */
  data?: Record<string, string>;
  children: ReactElement;
};

type TrackScrollProps = {
  /** The type of tracking to perform */
  type: 'scroll';
  /** Scroll tracking goal name — fires when element becomes visible. */
  name: string;
  /** Visibility threshold (0–1). Default: 0.5. */
  threshold?: number;
  /** Delay in ms before firing after visibility is met. */
  delay?: number;
  children: ReactElement;
};

export type TrackProps = TrackGoalProps | TrackScrollProps;

/** Headless wrapper that injects `data-cgd-*` attributes onto its child.
 * Renders no extra DOM node. */
export function Track(props: TrackProps): ReactElement {
  if (!isValidElement(props.children)) {
    return props.children;
  }

  const attrs: Record<string, string> = {};

  if (props.type === 'goal') {
    attrs[`${ATTR_PREFIX}-goal`] = props.name;
    if (props.data) {
      for (const [key, value] of Object.entries(props.data)) {
        attrs[`${ATTR_PREFIX}-goal-${key}`] = value;
      }
    }
  } else if (props.type === 'scroll') {
    attrs[`${ATTR_PREFIX}-scroll`] = props.name;
    if (props.threshold != null) {
      attrs[`${ATTR_PREFIX}-scroll-threshold`] = props.threshold.toString();
    }
    if (props.delay != null) {
      attrs[`${ATTR_PREFIX}-scroll-delay`] = props.delay.toString();
    }
  }

  return cloneElement(props.children, attrs);
}
