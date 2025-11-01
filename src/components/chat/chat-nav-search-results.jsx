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
