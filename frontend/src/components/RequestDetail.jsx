import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  getInvite,
  getApp,
  updateInvite,
  updateApplication
} from "../context/DashboardApi";

const RequestDetail = ({ id, request, toggle }) => {
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    role: "",
    message: ""
  });

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        let res = null;

        if (request === "sent_invites" || request === "received_invites") {
          res = await getInvite(id);
        } else {
          res = await getApp(id);
        }

        setRequestData(res);

        setFormData({
          role: res.role || "",
          message: res.message || ""
        });

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

  const isInvite =
    request === "sent_invites" || request === "received_invites";

  const isSent =
    request === "sent_apps" || request === "sent_invites";

  const canAct =
    requestData.status === 1 &&
    (request === "received_apps" || request === "received_invites");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (request === "sent_invites") {
        await updateInvite(requestData.id, formData);
      } else if (request === "sent_apps") {
        await updateApplication(requestData.id, formData);
      }

      toast.success("Request updated");
      toggle();

    } catch (err) {
      toast.error(err.message)
    }
  };

  const handleUpdateStatus = (type, id, status) => {
    console.log("Update status:", type, id, status);
  };

  const roleSelect = (
    <select
      name="role"
      value={formData.role}
      onChange={handleChange}
      className="border p-1 rounded"
    >
      <option value="">Select Role</option>
      <option value="Carry">🗡️ Carry</option>
      <option value="Mid">🔥 Mid</option>
      <option value="Offlane">🛡️ Offlane</option>
      <option value="Support">✨ Support</option>
      <option value="Hard Support">💎 Hard Support</option>
    </select>
  );

  return (
    <div className="popup">
      <div className="popup-inner">

        <h2 className="text-xl font-bold mb-4">Request Detail</h2>

        {isInvite ? (
          <div className="mb-4">

            <h3 className="font-semibold">Team Invite</h3>

            <p>
              <strong>Team:</strong> {requestData.team}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {isSent ? roleSelect : requestData.role}
            </p>

            <p>
              <strong>Message:</strong>{" "}
              {isSent ? (
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                requestData.message
              )}
            </p>

            <p>
              <strong>From:</strong>{" "}
              {requestData.sender?.username || "N/A"}
            </p>

            <p>
              <strong>To:</strong>{" "}
              {requestData.recipient?.user?.username || "N/A"}
            </p>

          </div>
        ) : (
          <div className="mb-4">

            <h3 className="font-semibold">Player Application</h3>

            <p>
              <strong>Team:</strong> {requestData.team}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {isSent ? roleSelect : requestData.role}
            </p>

            <p>
              <strong>Message:</strong>{" "}
              {isSent ? (
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                requestData.message
              )}
            </p>

            <p>
              <strong>Player:</strong>{" "}
              {requestData.player?.user?.username || "N/A"}
            </p>

            <p>
              <strong>Persona:</strong>{" "}
              {requestData.player?.persona || "N/A"}
            </p>

            <p>
              <strong>MMR:</strong>{" "}
              {requestData.player?.mmr ?? "N/A"}
            </p>

            <p>
              <strong>Preferred Roles:</strong>{" "}
              {requestData.player?.preferred_roles?.join(", ") || "N/A"}
            </p>

          </div>
        )}

        {canAct && (
          <div className="flex gap-2 mt-4">

            <button
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              onClick={() =>
                handleUpdateStatus(request, requestData.id, 1)
              }
            >
              Accept
            </button>

            <button
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              onClick={() =>
                handleUpdateStatus(request, requestData.id, 2)
              }
            >
              Decline
            </button>

          </div>
        )}

        {isSent && (
          <div className="mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}

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