import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getInvite, getApp } from "../context/DashboardApi";

const RequestDetail = ({ id, request, toggle }) => {
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        let res = null;

        // Decide API call based on type
        if (request === "sent_invites" || request === "received_invites") {
          res = await getInvite(id);
        } else {
          res = await getApp(id);
        }

        setRequestData(res);
      } catch (err) {
        toast.error("Failed to load request");
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id, request]);

  if (loading) return <div>Loading request...</div>;
  if (!requestData) return <div>No data available.</div>;
  const handleUpdateStatus = ( )=>{
    console.log('delete')

  }
  // Determine if this is an invite or application
  const isInvite = request === "sent_invites" || request === "received_invites";
  const canAct =
    requestData.status === 1 &&
    (request === "received_apps" || request === "received_invites");

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2 className="text-xl font-bold mb-4">Request Detail</h2>

        {/* Invite Display */}
        {isInvite ? (
          <div className="mb-4">
            <h3 className="font-semibold">Team Invite</h3>
            <p>
              <strong>Team:</strong> {requestData.team}
            </p>
            <p>
              <strong>Role:</strong> {requestData.role}
            </p>
            <p>
              <strong>Message:</strong> {requestData.message}
            </p>
            <p>
              <strong>From:</strong> {requestData.sender?.username || "N/A"}
            </p>
            <p>
              <strong>To:</strong> {requestData.recipient?.user?.username || "N/A"}
            </p>
          </div>
        ) : (
          /* Application Display */
          <div className="mb-4">
            <h3 className="font-semibold">Player Application</h3>
            <p>
              <strong>Team:</strong> {requestData.team}
            </p>
            <p>
              <strong>Role:</strong> {requestData.role}
            </p>
            <p>
              <strong>Message:</strong> {requestData.message}
            </p>
            <p>
              <strong>Player:</strong> {requestData.player?.user?.username || "N/A"}
            </p>
            <p>
              <strong>Persona:</strong> {requestData.player?.persona || "N/A"}
            </p>
            <p>
              <strong>MMR:</strong> {requestData.player?.mmr ?? "N/A"}
            </p>
            <p>
              <strong>Preferred Roles:</strong>{" "}
              {requestData.player?.preferred_roles?.join(", ") || "N/A"}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {canAct && (
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleUpdateStatus(request, requestData.id, 1)}
            >
              Accept
            </button>
            <button
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleUpdateStatus(request, requestData.id, 2)}
            >
              Decline
            </button>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={toggle}
            className="px-4 py-2 rounded-md bg-[#2c3445] text-gray-200 hover:bg-[#3b4458]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;