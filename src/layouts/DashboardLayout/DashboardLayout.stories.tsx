import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";

import DashboardLayout, { DashboardLayoutProps } from "./DashboardLayout";
import { REQUEST_METHOD } from "../../types";

export default {
  title: "layouts/DashboardLayout",
  component: DashboardLayout,
  argTypes: {},
} as Meta;

const defaultProps: Partial<DashboardLayoutProps> = {
  sections: [
    {
      items: [
        {
          title: "보험프로젝트",
          hasNew: true,
          childrenCount: 5,
          type: "project",
          items: [
            {
              title: "내보험 탭 데이터 조회",
              href: "/projects/insurances/main/1",
              requestMethod: REQUEST_METHOD.GET,
              type: "request",
            },
            {
              title: "보험메인",
              hasNew: true,
              childrenCount: 5,
              type: "group",
              items: [
                {
                  title: "내보험 탭 데이터 조회 내보험 탭 데이터 조회",
                  href: "/projects/insurances/main/1",
                  requestMethod: REQUEST_METHOD.GET,
                  type: "request",
                },
                {
                  title: "내보험 탭 데이터 조회",
                  href: "/projects/insurances/main/2",
                  requestMethod: REQUEST_METHOD.PUT,
                  hasNew: true,
                  type: "request",
                },
                {
                  title: "내보험 탭 데이터 조회",
                  href: "/projects/insurances/main/3",
                  requestMethod: REQUEST_METHOD.POST,
                  type: "request",
                },
                {
                  title: "내보험 탭 데이터 조회",
                  href: "/projects/insurances/main/4",
                  requestMethod: REQUEST_METHOD.DELETE,
                  type: "request",
                },
                {
                  title: "내보험 탭 데이터 조회",
                  href: "/projects/insurances/main/5",
                  requestMethod: REQUEST_METHOD.PATCH,
                  type: "request",
                },
              ],
            },
          ],
        },
      ],
      subheader: "내 프로젝트",
    },
  ],
};

const Template: Story<DashboardLayoutProps> = (args) => (
  <DashboardLayout {...defaultProps} {...args} />
);

export const 기본 = Template.bind({});
기본.args = {};
