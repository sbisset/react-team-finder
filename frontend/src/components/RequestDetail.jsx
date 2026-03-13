import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getInvite,
  getApp,
  acceptInvite,
  declineInvite,
  acceptApplication,
  rejectApplication
} from "../context/DashboardApi";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS = {
  1: "Pending",
  2: "Accepted",
  3: "Rejected",
};

const RequestDetail = ({ request, id, toggle, onActionSuccess }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        let result;
        if (request.includes("invite")) {
          result = await getInvite(id);
        } else {
          result = await getApp(id);
        }
        setData(result);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load request");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, request]);

  const handleAccept = async () => {
    try {
      if (request.includes("invite")) {
        await acceptInvite(id);
      } else {
        await acceptApplication(id);
      }
      toast.success("Accepted successfully");
      toggle();
      if (onActionSuccess) onActionSuccess(); // Refresh teams/dashboard
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async () => {
    try {
      if (request.includes("invite")) {
        await declineInvite(id);
      } else {
        await rejectApplication(id);
      }
      toast.success("Rejected");
      toggle();
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="popup">
        <div className="popup-inner">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  // Determine if action buttons should show
  const canAct =
    data.status === 1 && // pending
    ((data.player && data.player.user.id !== user.id) || // received application
      (data.recipient && data.recipient.user.id === user.id)); // received invite

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2 className="text-xl font-bold mb-4">Request Detail</h2>

        <p><strong>Team:</strong> {data.team}</p>

        {data.player && <p><strong>Player:</strong> {data.player.user.username}</p>}

        {data.recipient && <p><strong>Recipient:</strong> {data.recipient.user.username}</p>}

        <p><strong>Role:</strong> {data.role}</p>

        <p><strong>Message:</strong></p>
        <p className="text-slate-500 mb-4">{data.message}</p>

        <p className="mb-4"><strong>Status:</strong> {STATUS_LABELS[data.status]}</p>

        {canAct && (
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        )}

        <button
          onClick={toggle}
          className="mt-6 px-4 py-2 rounded-md bg-[#2c3445] text-gray-200 hover:bg-[#3b4458]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RequestDetail;