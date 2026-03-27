## 1. 安装依赖

- [x] 1.1 安装 `zustand`：`pnpm add zustand`

## 2. 创建 calorieStore

- [x] 2.1 创建 `src/stores/calorieStore.ts`，定义 state interface（entries、loading、error、selectedDate）
- [x] 2.2 实现 `fetchEntries(token, date)` action：设 loading，调用 getCalorieEntries，更新 entries，处理错误
- [x] 2.3 实现 `addEntry(token, data)` action：调用 createCalorieEntry，成功后重新执行 fetchEntries
- [x] 2.4 实现 `editEntry(token, id, data)` action：调用 updateCalorieEntry，成功后重新执行 fetchEntries
- [x] 2.5 实现 `removeEntry(token, id)` action：调用 deleteCalorieEntry，成功后从 entries 中过滤掉该条目
- [x] 2.6 实现 `setSelectedDate(date)` action：更新 selectedDate 字段

## 3. 创建 userProfileStore

- [x] 3.1 创建 `src/stores/userProfileStore.ts`，定义 state interface（profile、loading）
- [x] 3.2 实现 `fetchProfile(token)` action：设 loading，调用 userService，更新 profile
- [x] 3.3 实现 `clearProfile()` action：将 profile 重置为 null

## 4. 创建 healthAdviceStore

- [x] 4.1 创建 `src/stores/healthAdviceStore.ts`，定义 state interface（advice、loading、error）
- [x] 4.2 Store 初始化时从 sessionStorage 读取缓存数据到 advice 字段
- [x] 4.3 实现 `fetchAdvice(token, options?)` action：若 advice 非空且 `options.force` 不为 true 则直接返回；否则调用 getSuggestion，成功后更新 advice 并写入 sessionStorage
- [x] 4.4 实现 `clearAdvice()` action：重置 advice 为 null 并清除 sessionStorage 中的缓存键

## 5. 改造 useCalorieTracker Hook

- [x] 5.1 将 Hook 内 useState（entries、loading、error、selectedDate）替换为从 `calorieStore` 读取对应状态
- [x] 5.2 将 `loadEntries`（useCallback + useEffect）替换为调用 `calorieStore.fetchEntries`
- [x] 5.3 将 `handleSubmitRecord` 替换为调用 `calorieStore.addEntry` / `editEntry`
- [x] 5.4 将 `handleDeleteRecord` 替换为调用 `calorieStore.removeEntry`
- [x] 5.5 将 `setSelectedDate` 替换为调用 `calorieStore.setSelectedDate`，并在 selectedDate 变化时触发 fetchEntries
- [x] 5.6 确认 `UseCalorieTrackerReturn` 接口导出的字段和类型与原版完全一致

## 6. 改造 UserProfileContext

- [x] 6.1 将 `UserProfileContext` 内 useState（profile、loading）替换为从 `userProfileStore` 读取
- [x] 6.2 将 Context 内的 `fetchProfile` 调用替换为 `userProfileStore.fetchProfile`
- [x] 6.3 登出时调用 `userProfileStore.clearProfile()` 清除档案数据
- [x] 6.4 确认 Context 对外暴露的 `{ profile, loading }` 类型不变

## 7. 改造 HealthAdviceCard

- [x] 7.1 删除组件内的本地 loading/error/suggestion useState
- [x] 7.2 从 `healthAdviceStore` 读取 advice、loading、error
- [x] 7.3 组件挂载时调用 `fetchAdvice(token)`（命中缓存则不发请求）
- [x] 7.4 新增「重新获取」按钮，点击调用 `fetchAdvice(token, { force: true })`

## 8. 验证

- [x] 8.1 TypeScript 编译 0 错误（所有改动文件）
- [x] 8.2 确认首页日期切换后卡路里列表正确刷新
- [x] 8.3 确认健康建议页会话内再次访问不触发新请求（DevTools Network 验证）
- [x] 8.4 确认「重新获取」按钮能强制刷新建议内容
