import * as UE from 'ue';

/**
 * BP_Auto2DSortPriorityComponent 的 Puerts/TS 实现（class 风格）
 * 等价蓝图函数：SortPriority(Component Class)
 */
export default class BP_Auto2DSortPriorityComponent_TS extends UE.ActorComponent {
  // 蓝图同名变量：是否按拥有者位置排序
  bSortOnOwningActorLocation: boolean = false;

  /**
   * 等价于蓝图函数：SortPriority(Component Class)
   * @param ComponentClass 需要遍历/筛选的组件类（例如 UE.PrimitiveComponent.StaticClass() 或具体子类）
   */
  SortPriority(ComponentClass?: UE.Class): void {
    const owner = this.GetOwner();
    if (!owner) return;

    // 默认类：ActorComponent（与蓝图中默认值一致）
    const cls = ComponentClass ?? UE.ActorComponent.StaticClass();

    // GetComponentsByClass -> TArray<ActorComponent>
    const comps = owner.K2_GetComponentsByClass(cls) as UE.TArray<UE.ActorComponent>;
    const num = comps ? comps.Num() : 0;
    if (num <= 0) return;

    for (let i = 0; i < num; i++) {
      const comp = comps.Get(i);
      if (!comp) continue;

      // 动态转型到 PrimitiveComponent（蓝图里的“Cast To PrimitiveComponent”）
      const prim = comp instanceof UE.PrimitiveComponent ? (comp as UE.PrimitiveComponent) : null;
      if (!prim) continue;

      // Select(False=TrueComponentLoc, True=OwnerActorLoc, Index=bSortOnOwningActorLocation)
      const loc: UE.Vector = this.bSortOnOwningActorLocation
        ? owner.K2_GetActorLocation()
        : (prim as UE.SceneComponent).K2_GetComponentLocation(); // PrimitiveComponent 继承自 SceneComponent

      // 拆分向量 → 取 Y → 截断 → 作为半透明排序优先级（对应 BreakVector + FTrunc）
      const priority = Math.trunc(loc.Y);

      // SetTranslucentSortPriority
      prim.SetTranslucentSortPriority(priority);
    }
  }
}
