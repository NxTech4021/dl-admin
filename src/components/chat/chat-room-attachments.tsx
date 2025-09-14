"use client"

import PropTypes from "prop-types"
import { useBoolean } from "@/app/chat/hooks/use-boolean"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronRight } from "lucide-react"
// import FileThumbnail from "src/components/file-thumbnail"
// import { fDateTime } from "src/utils/format-time"

export default function ChatRoomAttachments({ attachments = [] }) { 
  const collapse = useBoolean(true)
  const totalAttachments = attachments.length

  const renderBtn = (
    <Button
      variant="ghost"
      onClick={collapse.onToggle}
      disabled={!attachments.length}
      className="flex items-center justify-between w-full h-10 px-3 text-xs font-medium text-muted-foreground bg-muted/50"
    >
      <span>Attachments ({totalAttachments})</span>
      {!attachments.length || !collapse.value ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </Button>
  )

  const renderContent = (
    <ScrollArea className="px-2 py-2.5 max-h-64">
      <div className="flex flex-col">
        {attachments?.map((attachment, index) => (
          <div
            key={attachment.name + index}
            className="flex items-center space-x-3 mb-2"
          >
            <div className="w-10 h-10 flex-shrink-0 rounded bg-muted overflow-hidden flex items-center justify-center">
              {/* <FileThumbnail
                imageView
                file={attachment.preview}
                onDownload={() => console.info("DOWNLOAD")}
                className="w-7 h-7"
              /> */}
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{attachment.name}</span>
              <span className="text-xs text-muted-foreground truncate mt-1">
                {/* {fDateTime(attachment.createdAt)} */}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <div className="flex flex-col">
      {renderBtn}

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          collapse.value ? "max-h-64" : "max-h-0"
        )}
      >
        {renderContent}
      </div>
    </div>
  )
}

ChatRoomAttachments.propTypes = {
  attachments: PropTypes.array,
}
