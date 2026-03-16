import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <LocalFireDepartmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calorie Tracker
          </Typography>
          <Button color="inherit">登录</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          今日概览
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="已摄入"
              value="1,200 kcal"
              icon={<RestaurantIcon color="primary" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="目标"
              value="2,000 kcal"
              icon={<LocalFireDepartmentIcon color="secondary" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="剩余"
              value="800 kcal"
              icon={<TrendingUpIcon color="success" />}
            />
          </Grid>
        </Grid>

        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              快速记录
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              点击下方按钮快速添加今日饮食记录
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" startIcon={<RestaurantIcon />}>
                添加食物
              </Button>
              <Button variant="outlined">查看历史</Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
