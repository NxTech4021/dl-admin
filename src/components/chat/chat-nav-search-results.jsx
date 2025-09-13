// import PropTypes from 'prop-types';

// import Avatar from '@mui/material/Avatar';
// import Typography from '@mui/material/Typography';
// import ListItemButton from '@mui/material/ListItemButton';

// import SearchNotFound from 'src/components/search-not-found';

// // ----------------------------------------------------------------------

// export default function ChatNavSearchResults({ query, results, onClickResult }) {
//   const totalResults = results.length;

//   const notFound = !totalResults && !!query;

//   return (
//     <>
//       <Typography
//         variant="h6"
//         sx={{
//           px: 2.5,
//           mb: 2,
//         }}
//       >
//         Contacts ({totalResults})
//       </Typography>

//       {notFound ? (
//         <SearchNotFound
//           query={query}
//           sx={{
//             p: 3,
//             mx: 'auto',
//             width: `calc(100% - 40px)`,
//             bgcolor: 'background.neutral',
//           }}
//         />
//       ) : (
//         <>
//           {results.map((result) => (
//             <ListItemButton
//               key={result.id}
//               onClick={() => onClickResult(result)}
//               sx={{
//                 px: 2.5,
//                 py: 1.5,
//                 typography: 'subtitle2',
//               }}
//             >
//               <Avatar alt={result.name} src={result.avatarUrl} sx={{ mr: 2 }} />
//               {result.name}
//             </ListItemButton>
//           ))}
//         </>
//       )}
//     </>
//   );
// }

// ChatNavSearchResults.propTypes = {
//   query: PropTypes.string,
//   results: PropTypes.array,
//   onClickResult: PropTypes.func,
// };


'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ChatNavSearchResults = ({ query, results, onClickResult }) => {
  const totalResults = results?.length || 0;
  const notFound = totalResults === 0 && !!query;

  return (
    <>
      <h6 className="px-2.5 mb-2 font-semibold text-base">
        Contacts ({totalResults})
      </h6>

      {notFound ? (
        <div
          className={cn(
            "p-3 mx-auto w-[calc(100%-40px)] bg-gray-100 dark:bg-gray-800 rounded-md text-center"
          )}
        >
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No results found for &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <>
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => onClickResult(result)}
              className="flex items-center px-2.5 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm font-semibold transition-colors"
            >
              <Avatar className="h-9 w-9 mr-2">
                <AvatarFallback>
                  {result.name ? result.name.charAt(0).toUpperCase() : 'N/A'}
                </AvatarFallback>
              </Avatar>
              {result.name}
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default ChatNavSearchResults;
