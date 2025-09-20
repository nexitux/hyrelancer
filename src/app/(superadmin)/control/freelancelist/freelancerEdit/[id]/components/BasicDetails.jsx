"use client";
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import adminApi, { setAdminToken, clearAdminToken } from "@/config/adminApi";

const { TextArea } = Input;

const BasicDetails = () => {
  const [form] = Form.useForm();
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Helper to normalize axios / fetch response shapes
  const unwrap = (res) => {
    // axios default: res.data; after changing interceptor it might already return data
    if (!res) return null;
    if (res?.data !== undefined) return res.data;
    return res;
  };

  useEffect(() => {
    if (!userIdBase64) {
      setLoading(false);
      setError("Missing user ID in route.");
      return;
    }

    const userId = userIdBase64;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Using adminApi central instance (handles token + 401 globally)
        const res = await adminApi.get(`/freelancers/${encodeURIComponent(userId)}`);
        const body = unwrap(res);

        // support multiple shapes: { data: { ... } } or {...}
        const user = body?.data ?? body;

        if (!user) {
          throw new Error("No user data received from API.");
        }

        setUserData(user);
        form.setFieldsValue({
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
        });
      } catch (err) {
        // adminApi interceptor already handles 401 by redirecting and clearing token.
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          (typeof err === "string" ? err : "Failed to fetch user data");
        setError(msg);
        console.error("Fetch user error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdBase64, form]); // router not required here

  const handleSave = async (values) => {
    setSaving(true);
    setError(null);

    const userId = userIdBase64;

    try {
      await form.validateFields();

      const payload = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
      };

      const res = await adminApi.put(`/freelancers/${encodeURIComponent(userId)}`, payload);
      const body = unwrap(res);

      if (!body) {
        throw new Error("Empty response from server");
      }

      if (body.errors) {
        // Map validation errors to AntD form fields
        const fields = Object.entries(body.errors).map(([fieldName, messages]) => ({
          name: fieldName,
          errors: Array.isArray(messages) ? messages : [String(messages)],
        }));
        form.setFields(fields);
        const joined = Object.values(body.errors).flat().join(", ");
        throw new Error(joined);
      }

      const successFlag = body.success ?? body?.status === "success" ?? !body?.error;
      if (!successFlag) {
        // If backend returns message when not success:
        throw new Error(body.message || body.error || "Failed to update user");
      }

      // Success path
      const updatedUser = body.data ?? body;
      setUserData(updatedUser);
      message.success(body.message || "User details updated successfully!");

      // If backend returns a refreshed token, store it centrally
      if (body.token) {
        setAdminTokenIfAvailable(body.token);
      }

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update user details";
      setError(msg);
      message.error(msg);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // small helper to set admin token if helper exists (keeps import safe)
  const setAdminTokenIfAvailable = (token) => {
    try {
      if (typeof setAdminToken === "function") {
        setAdminToken(token);
      } else {
        // fallback: write to localStorage directly, if needed
        if (typeof window !== "undefined") localStorage.setItem("adminToken", token);
      }
    } catch (e) {
      console.warn("setAdminToken fallback failed:", e);
    }
  };

  // Render loading / error as before
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Basic Details</h1>
              <p className="text-sm text-gray-500">Manage freelancer's basic information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Form content */}
        <div className="p-6">
          <Form form={form} layout="vertical" onFinish={handleSave} disabled={saving}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please input the name!" },
                    { max: 255, message: "Name cannot exceed 255 characters!" },
                  ]}
                >
                  <Input placeholder="Enter name" className="h-12" disabled={saving} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Mobile"
                  name="mobile"
                  rules={[
                    { required: true, message: "Please input the mobile number!" },
                    { max: 15, message: "Mobile number cannot exceed 15 characters!" },
                    { pattern: /^[0-9+\-\s()]*$/, message: "Please enter a valid mobile number!" },
                  ]}
                >
                  <Input placeholder="Enter mobile number" className="h-12" disabled={saving} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input the email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input placeholder="Enter email" className="h-12" disabled={saving} />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end items-center pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BasicDetails;
