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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  const timeout = setTimeout(async () => {
    setCheckingUsername(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for duplicate usernames but exclude current user
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, auth_id")
        .eq("username", profile.username)
        .neq("auth_id", user.id)
        .maybeSingle();

      setUsernameAvailable(!existingUser);
    } catch (err) {
      console.error("Username check failed:", err);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, 500);
// inside AccountDetails.tsx

  // ✅ Save profile updates
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (profile.username && !/^[A-Za-z0-9_]{3,20}$/.test(profile.username)) {
      setError("Username must be 3–20 characters (letters, numbers, or underscores only).");
      setSaving(false);
      return;
    }

    try {
      // Get the currently logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not logged in.");

      // Update the users table using Supabase Admin client
      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          username: profile.username || null,
        })
        .eq("auth_id", user.id);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");

      // Refresh profile state from database
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("first_name, last_name, username, email")
        .eq("auth_id", user.id)
        .single();

      if (fetchError) {
        console.error(fetchError);
      } else if (data) {
        setProfile(data);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError(null);

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

      setSuccess("Your account has been permanently deleted. All data erased.");
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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
                className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {field === "username" && (
                <>
                  {profile.username === "" ? (
                    <p className="text-xs text-gray-400">Enter a username (optional)</p>
                  ) : !/^[A-Za-z0-9_]{3,20}$/.test(profile.username) ? (
                    <p className="text-xs text-red-400">Invalid: 3–20 chars, letters/numbers/underscores only</p>
                  ) : checkingUsername ? (
                    <p className="text-xs text-gray-400">Checking username...</p>
                  ) : usernameAvailable === false ? (
                    <p className="text-xs text-red-400">Username already taken.</p>
                  ) : usernameAvailable === true ? (
                    <p className="text-xs text-green-400">Username available!</p>
                  ) : (
                    <p className="text-xs text-gray-400">• 3–20 chars, letters/numbers/underscores only</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Save control */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded text-white font-semibold ${
              saving
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
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
        <div className="mt-8 border-t border-gray-700 pt-6 relative">
          <h3 className="text-xl text-white font-semibold mb-3">Danger Zone</h3>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded p-2 w-full"
          >
            Delete Account
          </button>

          {/* Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
              <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md text-center border border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Confirm Deletion</h2>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to permanently delete your account? <br />
                  <span className="text-red-400 font-semibold">This cannot be undone.</span> <br />
                  All voting history, saved preferences, and data will be erased forever.
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className={`px-4 py-2 rounded text-white ${
                      deleting ? "bg-gray-600" : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {deleting ? "Deleting..." : "Yes, Delete My Account"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Feedback */}
        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center mt-4 animate-pulse">{success}</p>}
      </div>
    </div>
  );
}
