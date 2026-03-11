import toast from "react-hot-toast"
import { useEffect, useState } from "react"

const RequestDetail = ({ request, id, toggle }) => {

  const [teamInvite, setTeamInvite] = useState(null)
  const [teamApp, setTeamApp] = useState(null)

  useEffect(() => {

    const fetchRequest = async () => {

      try {

        let url = ""

        if (request === "sent_apps") {
          url = `/api/team-applications/${id}/`
        } 
        else if (request === "sent_invites") {
          url = `/api/team-invites/${id}/`
        }

        const res = await fetch(url)
        const data = await res.json()

        if (request === "sent_apps") {
          setTeamApp(data)
        } 
        else {
          setTeamInvite(data)
        }

      } catch (err) {
        toast.error("Failed to load request details")
      }

    }

    fetchRequest()

  }, [request, id])

  return (
    <div className="popup">
      <div className="popup-inner">

        <h2 className="text-xl font-bold mb-4">Request Detail</h2>
            <div>
            <p><strong>Team:</strong> Test team Name </p>
            <p><strong>Role:</strong> Role</p>
            <p><strong>Message:</strong> Message: Hello.....................</p>
          </div>
        {teamInvite && (
          <div>
            <p><strong>Team:</strong> {teamInvite.team}</p>
            <p><strong>Role:</strong> {teamInvite.role}</p>
            <p><strong>Message:</strong> {teamInvite.message}</p>
          </div>
        )}

        {teamApp && (
          <div>
            <p><strong>Team:</strong> {teamApp.team}</p>
            <p><strong>Role:</strong> {teamApp.role}</p>
            <p><strong>Message:</strong> {teamApp.message}</p>
          </div>
        )}

        
        <button className="mt-4 px-4 py-2 rounded-md bg-[#2c3445] text-gray-200 hover:bg-[#3b4458]">
            Accept
        </button>
        <button className="mt-4 px-4 py-2 rounded-md bg-[#2c3445] text-gray-200 hover:bg-[#3b4458]">
            Decline
        </button>

        <button
          type="button"
          onClick={toggle}
          className="mt-4 px-4 py-2 rounded-md bg-[#2c3445] text-gray-200 hover:bg-[#3b4458]"
        >
          Close
        </button>

      </div>
    </div>
  )
}

export default RequestDetail