"use client"

import { useRouter } from "next/navigation"
import { BellMinus } from "lucide-react"
import { useNotificationStore } from "../store/useFarcasterStore"

export default function Notifications() {
  const route = useRouter()
  const { notify } = useNotificationStore()

  return (
    <div className={`my-16`}>
      {
        (notify?.length ?? 0) > 0 ? (
          <>
            {
              notify?.map(notification => {
                return (
                  <div className="border-b border-gray-500/30" key={notification.imageUrl}>
                    {/* Image */}
                    <div 
                      className="border-b max-h-[25%] p-1 flex items-center justify-center"
                      onClick={() => {
                        route.push(`nft/${notification.tokenId}`)
                      }}
                    >
                      <img 
                        src={notification?.imageUrl} 
                        alt={notification?.buyer}
                      />
                      <div>
                        <p>
                          <span>{notification.buyer}</span>
                          <span>{notification.price}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </>
        ) : (
          <>
            <BellMinus size={30} className="text-teal-500/80 mb-3"/>
            <span className="text-lg text-teal-600/80">No Notifications</span>
          </>
        )
      }
    </div>
  )
}
