import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaEye as EyeIcon, FaEyeSlash as EyeOffIcon } from "react-icons/fa6";

export default function AccountDetails() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  });

  // ✅ Use Render backend or fallback to Vite env
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://getgood-api.onrender.com";

  const [editMode, setEditMode] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // password change states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load profile info
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to load account.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("first_name, last_name, username, email")
        .eq("auth_id", user.id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const isValidUsername = (uname: string) => /^[A-Za-z0-9_]{3,20}$/.test(uname);

  // Debounced username availability check
  useEffect(() => {
    if (!editMode || !profile.username || !isValidUsername(profile.username)) {
      setUsernameAvailable(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`${API_BASE}/api/check-username`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: profile.username }),
        });

        const data = await res.json();
        setUsernameAvailable(!data.exists);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [profile.username, editMode]);

  // ✅ Save profile updates via backend
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (profile.username && !isValidUsername(profile.username)) {
      setError("Username must be 3–20 characters (letters, numbers, or underscores only).");
      setSaving(false);
      return;
    }

    if (usernameAvailable === false) {
      setError("Username is already taken.");
      setSaving(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!token || !user) throw new Error("Not logged in.");

      const res = await fetch(`${API_BASE}/api/update-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          token,
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          username: profile.username || null,
        }),
      });

      // ✅ Prevent invalid JSON parse if empty body
      const text = await res.text();
      let result;
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!res.ok) throw new Error(result.error || "Failed to update profile.");

      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Change password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8 || /\s/.test(newPassword)) {
      setError("Password must be at least 8 characters with no spaces.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // ✅ Delete account
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !token) throw new Error("No active session.");

      const res = await fetch(`${API_BASE}/api/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, token }),
      });

      const text = await res.text();
      let result;
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!res.ok) throw new Error(result.error || "Failed to delete account.");

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return <div className="text-gray-300 p-6">Loading account details...</div>;

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">
          Account Details
        </h2>

        {/* Profile info */}
        <div className="flex flex-col gap-3">
          {["first_name", "last_name", "username"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm text-gray-300 mb-1 capitalize">
                {field.replace("_", " ")}
              </label>
              <input
                type="text"
                value={(profile as any)[field] || ""}
                onChange={(e) =>
                  setProfile({ ...profile, [field]: e.target.value })
                }
                disabled={!editMode}
                className={`p-2 rounded bg-gray-800 text-white border ${
                  !editMode
                    ? "opacity-60 cursor-not-allowed"
                    : "border-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {field === "username" && editMode && (
                <>
                  {checkingUsername ? (
                    <p className="text-xs text-gray-400">Checking username...</p>
                  ) : usernameAvailable === false ? (
                    <p className="text-xs text-red-400">
                      Username already taken.
                    </p>
                  ) : usernameAvailable === true ? (
                    <p className="text-xs text-green-400">
                      Username available.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      • 3–20 chars, letters/numbers/underscores only
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Edit/Save controls */}
        <div className="flex justify-between mt-6">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded text-white ${
                  saving
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Change Password */}
        <form
          onSubmit={handlePasswordChange}
          className="mt-8 border-t border-gray-700 pt-6 flex flex-col gap-3"
        >
          <h3 className="text-xl text-white font-semibold mb-2">
            Change Password
          </h3>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <div
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <div
              className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded p-2"
          >
            Update Password
          </button>
        </form>

        {/* Delete Account */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h3 className="text-xl text-white font-semibold mb-3">Danger Zone</h3>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded p-2 w-full"
          >
            Delete Account
          </button>
        </div>

        {/* Feedback */}
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center mt-4">{success}</p>}
      </div>
    </div>
  );
}
