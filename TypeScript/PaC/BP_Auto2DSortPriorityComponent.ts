import * as UE from 'ue'

/**
 * Puerts translation of BP_Auto2DSortPriorityComponent.SortPriority
 *
 * Blueprint summary:
 * - 获取拥有者 Actor
 * - 根据传入的 ComponentClass 在 Actor 上收集组件数组
 * - 遍历组件，尝试转换为 PrimitiveComponent
 * - 计算排序优先级：
 *   - 若 bSortOnOwningActorLocation 为 true：用 Owner 的世界位置
 *   - 否则：用该组件的世界位置
 *   - 取位置向量的 Y 分量，FTrunc 成整数
 * - 调用 SetTranslucentSortPriority(priority)
 */
export function SortPriority(self: UE.ActorComponent, ComponentClass?: UE.Class): void {
  if (!self) return;

  // 1) 获取拥有者
  const owner = self.GetOwner();
  if (!owner) return;

  // 2) 组件类：默认使用 ActorComponent
  const cls = ComponentClass ?? UE.ActorComponent.StaticClass();

  // 3) 获取组件数组（Actor.K2_GetComponentsByClass）
  const comps = owner.K2_GetComponentsByClass(cls) as UE.TArray<UE.ActorComponent>;
  if (!comps || comps.Num() === 0) return;

  // 读取蓝图变量 bSortOnOwningActorLocation（若不存在则默认为 false）
  const sortOnOwner = (self as any).bSortOnOwningActorLocation === true;

  // 4) 遍历组件
  for (let i = 0; i < comps.Num(); i++) {
    const ac = comps.Get(i);
    if (!ac) continue;

    // 动态转换为 PrimitiveComponent（蓝图里是 DynamicCast）
    const prim = ac as unknown as UE.PrimitiveComponent;

    // 运行时存在性检查：需要具备方法 SetTranslucentSortPriority
    if (!prim || typeof (prim as any).SetTranslucentSortPriority !== 'function') {
      continue; // cast failed
    }

    // 5) 计算位置向量：根据 sortOnOwner 选择 Owner 或 组件自身的位置
    const pos: UE.Vector = sortOnOwner
      ? owner.K2_GetActorLocation()
      : (prim as UE.SceneComponent).K2_GetComponentLocation();

    const y = pos.Y;                // BreakVector -> Y
    const priority = Math.trunc(y); // KismetMathLibrary.FTrunc

    // 6) 设置半透明排序优先级
    prim.SetTranslucentSortPriority(priority);
  }
}

// 可选：提供一个默认导出，便于在其他脚本中直接调用
export default {
  SortPriority,
};
