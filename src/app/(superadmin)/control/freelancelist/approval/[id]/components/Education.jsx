"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, Tag, Button, Row, Col, message, Space, Typography } from "antd";
import { CarryOutOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

// Simple token helper (reads admin token from localStorage)
const TokenManager = {
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null),
  clearToken: () => { if (typeof window !== "undefined") localStorage.removeItem("adminToken"); }
};

export default function AdminProfessionalDisplay() {
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id ? decodeURIComponent(params.id) : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [isApproving, setIsApproving] = useState(false);

  // Fetch GET API and populate display-only state
  const fetchProfessionalData = async () => {
    if (!userIdBase64) {
      setError("Missing user id in route");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = TokenManager.getToken();
      const res = await fetch(`https://test.hyrelancer.in/api/admin/getFeUProfessional/${userIdBase64}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

      if (!res.ok) {
        if (res.status === 401) {
          TokenManager.clearToken();
          message.error("Unauthorized. Redirecting to login...");
          router.push("/admin/login");
          return;
        }
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      if (data && data.u_profile) {
        setProfessional(data.u_profile || null);
        setEducation(Array.isArray(data.fe_edu) ? data.fe_edu : []);
        setExperience(Array.isArray(data.fe_work) ? data.fe_work : []);
      } else {
        setProfessional(null);
        setEducation([]);
        setExperience([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfessionalData(); }, [userIdBase64]);

  // Approve action (example endpoint) - adjust endpoint/name if your API differs
  const handleApprove = async () => {
    if (!userIdBase64) return;
    try {
      setIsApproving(true);
      const token = TokenManager.getToken();

      // NOTE: This endpoint name is a best-effort guess. Change to your real approve endpoint if different.
      const res = await fetch("https://test.hyrelancer.in/api/admin/approveFeUProfessional", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fp_u_id: userIdBase64, action: "approve" }),
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

      if (!res.ok) {
        if (res.status === 401) {
          TokenManager.clearToken();
          message.error("Unauthorized. Please login again.");
          router.push("/admin/login");
          return;
        }
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      message.success(data?.message || "User approved successfully");
      // refresh the display after approval
      await fetchProfessionalData();
    } catch (err) {
      console.error("Approve error:", err);
      message.error(err.message || "Failed to approve user");
    } finally {
      setIsApproving(false);
    }
  };

  // Display components
  const ProfessionalCard = () => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <Row gutter={16} className="items-center">
        <Col xs={24} md={8}>
          <Text strong>Occupation</Text>
          <div><Text>{professional?.fp_occupation || "Not specified"}</Text></div>
        </Col>
        <Col xs={24} md={8}>
          <Text strong>Experience</Text>
          <div><Text>{professional?.fp_ex_year || "Not specified"}</Text></div>
        </Col>
        <Col xs={24} md={8}>
          <Text strong>Show Education</Text>
          <div>
            <Tag color={professional?.fp_add_edu_profile === "1" ? "green" : "red"}>
              {professional?.fp_add_edu_profile === "1" ? "Yes" : "No"}
            </Tag>
          </div>
        </Col>
      </Row>
    </div>
  );

  const EducationTable = () => (
    <Table
      dataSource={education}
      rowKey={(row) => row.fc_id || `${row.fc_type}_${row.fc_year}`}
      pagination={false}
      columns={[
        { title: "Type", dataIndex: "fc_type", key: "type", render: t => <Tag>{t}</Tag> },
        { title: "Title", dataIndex: "fc_title", key: "title" },
        { title: "Institution", dataIndex: "fc_collage", key: "institution" },
        { title: "Year", dataIndex: "fc_year", key: "year" },
      ]}
      locale={{ emptyText: "No education records found." }}
      size="small"
    />
  );

  const ExperienceTable = () => (
    <Table
      dataSource={experience}
      rowKey={(row) => row.fj_id || `${row.fj_position}`}
      pagination={false}
      columns={[
        { title: "Position", dataIndex: "fj_position", key: "position" },
        { title: "Duration", dataIndex: "fj_year", key: "duration", render: d => <Tag>{d}</Tag> },
        { title: "Description", dataIndex: "fj_desc", key: "description" },
      ]}
      locale={{ emptyText: "No experience records found." }}
      size="small"
    />
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CarryOutOutlined className="text-blue-600" />
            </div>
            <div>
              <Title level={4} className="m-0">Professional Details</Title>
              <Text type="secondary">Display-only view fetched via GET API</Text>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 border border-red-100 rounded">{error}</div>}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <Space direction="vertical" size="large" className="w-full">
              <ProfessionalCard />

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <Title level={5} className="mb-4">Education</Title>
                <EducationTable />
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <Title level={5} className="mb-4">Work Experience</Title>
                <ExperienceTable />
              </div>

              {/* Approve button placed at bottom center */}
              {/* <div className="flex justify-center py-4">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="large"
                  loading={isApproving}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              </div> */}
            </Space>
          )}
        </div>
      </div>
    </div>
  );
}
