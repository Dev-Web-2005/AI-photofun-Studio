import React, { useState } from "react";
import { X, Users, Loader2, Crown } from "lucide-react";

const CreateGroupModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
    const [groupName, setGroupName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (groupName.trim()) {
            onSubmit(groupName.trim());
            setGroupName("");
        }
    };

    const handleClose = () => {
        setGroupName("");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={handleClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl transform transition-all duration-300 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Premium Badge */}
                <div className="mx-4 mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border border-yellow-200">
                    <div className="flex items-center gap-2 text-sm">
                        <Crown className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-700">
                            This feature is for members{" "}
                            <span className="font-bold text-transparent bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text">
                                Premium
                            </span>
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Name
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!groupName.trim() || isLoading}
                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Group"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
