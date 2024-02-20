import { createIcon } from '@chakra-ui/react';

const DeleteUserIcon = createIcon({
  displayName: 'DeleteUserIcon',
  viewBox: '0 0 100 100',
  path: (
    <>
      <rect width="100" height="100" rx="10" fill="#EF9B8F" fillOpacity="0.1" />
      <circle
        cx="49.5"
        cy="39.5"
        r="11.5"
        fill="#EF9B8F"
        fillOpacity="0.1"
        stroke="#EF9B8F"
        strokeWidth="1.5"
      />
      <path
        d="M67 68.5C67 72.8513 62.8513 72 49.5 72C37.1487 72 32 72.8513 32 68.5C32 62.1487 41.1487 55 49.5 55C57.8513 55 67 62.1487 67 68.5Z"
        stroke="#EF9B8F"
        fill="#EF9B8F"
        fillOpacity="0.1"
        strokeWidth="1.5"
      />
    </>
  ),
});

export { DeleteUserIcon };
