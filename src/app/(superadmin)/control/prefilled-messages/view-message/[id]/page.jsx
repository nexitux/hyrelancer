'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import { MdArrowBack, MdMessage, MdPerson, MdCalendarToday, MdCheckCircle, MdCancel } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import adminApi from '@/config/adminApi';

const decodeId = (encodedId) => {
  try {
    return Base64.decode(encodedId);
  } catch (error) {
    return null;
  }
};

const ViewMessage = ({ params }) => {
  const { id: encodedId } = params;
  const router = useRouter();
  const decodedId = encodedId ? decodeId(encodedId) : null;

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch message data on component mount
  const fetchMessageData = useCallback(async () => {
    if (!decodedId) {
      setError("Invalid message ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await adminApi.get(`/messages/${encodedId}`);
      const data = response.data.message;
      setMessage(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [decodedId, encodedId]);

  useEffect(() => {
    fetchMessageData();
  }, [fetchMessageData]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/control/prefilled-messages')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Message not found</p>
          <button
            onClick={() => router.push('/control/prefilled-messages')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/control/prefilled-messages')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Messages"
            >
              <MdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Message Details</h1>
              <p className="text-sm text-gray-500">View prefilled message information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Message Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
                  <MdMessage className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Message #{message.id}</h2>
                  <p className="text-sm text-gray-500">Prefilled Message</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  message.is_active === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message.is_active === 1 ? (
                    <>
                      <MdCheckCircle size={16} className="mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <MdCancel size={16} className="mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="p-6">
            {/* Message Body */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Message Content</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {message.body}
                </p>
              </div>
            </div>

            {/* Message Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            

              {/* Created Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MdCalendarToday className="text-gray-600" size={20} />
                  <h3 className="text-sm font-medium text-gray-700">Created Date</h3>
                </div>
                <p className="text-gray-800 font-medium">
                  {formatDate(message.created_at)}
                </p>
              </div>

              {/* Updated Date */}
              {message.updated_at && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MdCalendarToday className="text-gray-600" size={20} />
                    <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {formatDate(message.updated_at)}
                  </p>
                </div>
              )}

              {/* Deleted By (if applicable) */}
              {message.deleted_by && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MdPerson className="text-gray-600" size={20} />
                    <h3 className="text-sm font-medium text-gray-700">Deleted By</h3>
                  </div>
                  <p className="text-gray-800 font-medium">
                    User ID: {message.deleted_by}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.push('/control/prefilled-messages')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to List
              </button>
              <button
                onClick={() => router.push(`/control/prefilled-messages/edit-message/${encodedId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMessage;
