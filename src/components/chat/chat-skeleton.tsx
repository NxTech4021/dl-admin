// import PropTypes from 'prop-types';

// import Stack from '@mui/material/Stack';
// import Skeleton from '@mui/material/Skeleton';

// // ----------------------------------------------------------------------

// export function ChatNavItemSkeleton({ sx, ...other }) {
//   return (
//     <Stack
//       spacing={2}
//       direction="row"
//       alignItems="center"
//       sx={{
//         px: 2.5,
//         py: 1.5,
//         ...sx,
//       }}
//       {...other}
//     >
//       <Skeleton variant="circular" sx={{ width: 48, height: 48 }} />

//       <Stack spacing={1} flexGrow={1}>
//         <Skeleton sx={{ width: 0.75, height: 10 }} />
//         <Skeleton sx={{ width: 0.5, height: 10 }} />
//       </Stack>
//     </Stack>
//   );
// }

// ChatNavItemSkeleton.propTypes = {
//   sx: PropTypes.object,
// };

'use client';

import { cn } from "@/lib/utils"; 

const ChatNavItemSkeleton = ({ className, ...other } : any) => {
  return (
    <div
      className={cn("flex flex-row items-center space-x-2 px-2.5 py-1.5", className)}
      {...other}
    >
      {/* Avatar Skeleton */}
      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />

      {/* Text Skeletons */}
      <div className="flex flex-col flex-grow space-y-1">
        <div className="w-[75%] h-2 rounded bg-gray-200 animate-pulse" />
        <div className="w-[50%] h-2 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

export default ChatNavItemSkeleton;
