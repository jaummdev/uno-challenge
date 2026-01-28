import { AssignmentOutlined } from "@mui/icons-material";
import { styled } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
`;

export const ContainerTop = styled.form`
  display: inline-flex;
  background-color: #efefef;
  justify-content: center;
  padding: 8px;
  gap: 8px;
  border-radius: 16px;
  width: 100%;
`;

export const ContainerList = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
`;
export const ContainerListItem = styled.div`
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 16px;
  width: 100%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
`;

export const Title = styled.div`
  font-weight: bold;
  font-size: 32px;
  margin-bottom: 16px;
  color: #fff;
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #999;
`;

export const EmptyStateIcon = styled(AssignmentOutlined)`
  font-size: 64px !important;
  margin-bottom: 16px;
  opacity: 0.5;
`;

export const EmptyStateText = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #666;
`;

export const EmptyStateSubtext = styled.div`
  font-size: 14px;
  color: #999;
`;
