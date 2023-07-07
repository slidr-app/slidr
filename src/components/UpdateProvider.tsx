import {
  createContext,
  type PropsWithChildren,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {useRegisterSW} from 'virtual:pwa-register/react';

type UpdateHandler = {
  needRefresh: boolean;
  setIsHandlerOverridden: (override: boolean) => void;
  update: () => void;
};

export const UpdateContext = createContext<UpdateHandler>({
  // Hybrid interface combining the vite-pwa react example: https://vite-pwa-org.netlify.app/frameworks/react.html
  // along with a way 1 child component to override the auto update.
  needRefresh: false,
  setIsHandlerOverridden: () => undefined,
  update: () => undefined,
});

export function UpdateProvider({children}: PropsWithChildren) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('SW Registered:', registration);

      if (registration) {
        setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const update = useCallback(() => {
    console.log('Updating');
    void updateServiceWorker(true);
  }, [updateServiceWorker]);

  // If one day multiple child components want to delay the update,
  // this should use a stack with push/pop when overrides happen.
  const [isHandlerOverridden, setIsHandlerOverridden] =
    useState<boolean>(false);
  useEffect(() => {
    if (needRefresh && !isHandlerOverridden) {
      update();
    }
  }, [needRefresh, isHandlerOverridden, update]);

  const updateContext = useMemo<UpdateHandler>(
    () => ({
      // Consider forcing this to false if the override is true
      // Maybe that would be more consistent? Or maybe just more complex???
      needRefresh,
      setIsHandlerOverridden,
      update,
    }),
    [setIsHandlerOverridden, needRefresh, update],
  );

  return (
    <UpdateContext.Provider value={updateContext}>
      {children}
    </UpdateContext.Provider>
  );
}
