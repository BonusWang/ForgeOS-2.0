#!/usr/bin/env python3
"""
ForgeOS Data MCP Server.

AI tools read/write ForgeOS data via MCP protocol.
Talks to the vite dev server's /__forge_data__/ HTTP interface.
The browser syncs to COS automatically.

Prerequisite: ForgeOS dev server running on localhost:5173
(use forge-launcher skill to start it).
"""

import json
import os
import time
import uuid
import urllib.request
import urllib.error
from datetime import datetime, timedelta

from mcp.server.fastmcp import FastMCP

FORGE_HOST = os.environ.get("FORGE_HOST", "localhost")
FORGE_PORT = int(os.environ.get("FORGE_PORT", "5173"))
BASE_URL = f"http://{FORGE_HOST}:{FORGE_PORT}/__forge_data__"

mcp = FastMCP("forge-os-data")


# ─── HTTP helpers ───

def _get_state():
    """GET the full forge-storage record (zustand persist format)."""
    url = f"{BASE_URL}/forge-storage"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=5) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else {}


def _put_state(full_record):
    """PUT the full forge-storage record back."""
    url = f"{BASE_URL}/forge-storage"
    body = json.dumps(full_record, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url, data=body, method="PUT",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _get(entity: str):
    """GET an entity array from the zustand persist state."""
    record = _get_state()
    state = record.get("state", {})
    return state.get(entity)


def _put(entity: str, data):
    """Update an entity array in the zustand persist state."""
    record = _get_state()
    state = record.get("state", {})
    state[entity] = data
    record["state"] = state
    return _put_state(record)


def _check_server():
    """Verify ForgeOS dev server is reachable."""
    try:
        _get_state()
    except (urllib.error.URLError, ConnectionError, OSError):
        raise ConnectionError(
            "ForgeOS dev server 未运行。请先启动: "
            "powershell -File scripts/forge-service.ps1 start"
        )


def _gen_id(prefix: str = "item") -> str:
    return f"{prefix}-{int(time.time() * 1000)}-{uuid.uuid4().hex[:8]}"


def _today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def _date_to_column(date_str: str) -> str:
    """Convert YYYY-MM-DD to day-of-week column code (MON..SUN)."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    cols = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
    return cols[dt.weekday()]


# ─── Task tools ───

@mcp.tool()
def list_tasks(date: str = "", status: str = "") -> str:
    """列出 ForgeOS 中的任务，可按日期和状态过滤。

    Args:
        date: 过滤日期 YYYY-MM-DD，留空返回全部
        status: 过滤状态 active/completed，留空返回全部

    Returns:
        任务列表 JSON
    """
    _check_server()
    tasks = _get("tasks") or []
    if date:
        tasks = [t for t in tasks if t.get("date") == date]
    if status:
        tasks = [t for t in tasks if t.get("status") == status]
    return json.dumps(tasks, ensure_ascii=False)


@mcp.tool()
def create_task(content: str, date: str, column: str = "") -> str:
    """在 ForgeOS 创建新任务。

    Args:
        content: 任务内容(简短行动摘要,≤20字,动宾结构。去掉修饰语/文档引用/技术细节)
        date: 任务日期 YYYY-MM-DD
        column: 所在列 MON/TUE/WED/THU/FRI/SAT/SUN，留空按日期自动推算

    Returns:
        创建的任务 JSON
    """
    _check_server()
    if not column:
        column = _date_to_column(date)
    tasks = _get("tasks") or []
    task = {
        "id": _gen_id("task"),
        "content": content,
        "column": column,
        "date": date,
        "status": "active",
        "order": len(tasks),
    }
    tasks.append(task)
    _put("tasks", tasks)
    return json.dumps(task, ensure_ascii=False)


@mcp.tool()
def update_task_status(task_id: str, status: str) -> str:
    """修改 ForgeOS 任务状态。

    Args:
        task_id: 任务 ID
        status: 新状态 active/completed

    Returns:
        更新后的任务 JSON
    """
    _check_server()
    tasks = _get("tasks") or []
    found = None
    for t in tasks:
        if t.get("id") == task_id:
            t["status"] = status
            if status == "completed":
                t["completedAt"] = datetime.now().isoformat()
            elif "completedAt" in t:
                del t["completedAt"]
            found = t
            break
    if not found:
        return json.dumps({"error": f"task {task_id} not found"}, ensure_ascii=False)
    _put("tasks", tasks)
    return json.dumps(found, ensure_ascii=False)


# ─── Reflection tools ───

@mcp.tool()
def list_reflections(start_date: str = "", end_date: str = "") -> str:
    """列出 ForgeOS 复盘记录，可按日期范围过滤。

    Args:
        start_date: 起始日期 YYYY-MM-DD，留空不限
        end_date: 结束日期 YYYY-MM-DD，留空不限

    Returns:
        复盘列表 JSON
    """
    _check_server()
    reflections = _get("reflections") or []
    if start_date:
        reflections = [r for r in reflections if r.get("date", "") >= start_date]
    if end_date:
        reflections = [r for r in reflections if r.get("date", "") <= end_date]
    return json.dumps(reflections, ensure_ascii=False)


@mcp.tool()
def add_reflection(date: str, answers: str, tags: str = "", template_id: str = "default") -> str:
    """写入一条每日复盘到 ForgeOS。

    Args:
        date: 复盘日期 YYYY-MM-DD
        answers: 复盘内容 JSON 字符串，如 {"能量":"3","卡点":"xxx","下一步":"yyy"}
        tags: 标签逗号分隔，留空无标签
        template_id: 模板 ID，默认 default

    Returns:
        创建的复盘 JSON
    """
    _check_server()
    answers_dict = json.loads(answers) if isinstance(answers, str) else answers
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    reflections = _get("reflections") or []
    reflection = {
        "id": _gen_id("reflection"),
        "date": date,
        "kind": "daily",
        "templateId": template_id,
        "answers": answers_dict,
        "tags": tag_list,
        "createdAt": datetime.now().isoformat(),
    }
    reflections.append(reflection)
    _put("reflections", reflections)
    return json.dumps(reflection, ensure_ascii=False)


# ─── Context tools ───

@mcp.tool()
def get_moods(days: int = 7) -> str:
    """读取近期心情和能量数据。

    Args:
        days: 最近多少天，默认 7

    Returns:
        心情记录列表 JSON，每条含 date/mood/energy/note
    """
    _check_server()
    moods = _get("moods") or []
    cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    moods = [m for m in moods if m.get("date", "") >= cutoff]
    moods.sort(key=lambda m: m.get("date", ""))
    return json.dumps(moods, ensure_ascii=False)


@mcp.tool()
def get_okr() -> str:
    """读取当前 OKR（月度目标和关键结果）。

    Returns:
        OKR 列表 JSON，每个含 title/period/keyResults
    """
    _check_server()
    objectives = _get("objectives") or []
    return json.dumps(objectives, ensure_ascii=False)


# ─── Inspiration tools ───

@mcp.tool()
def add_inspiration(content: str, tags: str = "") -> str:
    """捕获灵感到 ForgeOS 灵感库。

    Args:
        content: 灵感内容
        tags: 标签逗号分隔，留空无标签

    Returns:
        创建的灵感 JSON
    """
    _check_server()
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    inspirations = _get("inspirations") or []
    inspiration = {
        "id": _gen_id("inspiration"),
        "content": content,
        "tags": tag_list,
        "createdAt": datetime.now().isoformat(),
    }
    inspirations.append(inspiration)
    _put("inspirations", inspirations)
    return json.dumps(inspiration, ensure_ascii=False)


# ─── Aggregate tools ───

@mcp.tool()
def get_today_status() -> str:
    """获取今日综合状态：未完成任务 + 今日心情。

    Returns:
        JSON，含 date/pending_tasks/pending_count/mood
    """
    _check_server()
    today = _today()
    tasks = _get("tasks") or []
    pending = [t for t in tasks if t.get("date") == today and t.get("status") == "active"]
    moods = _get("moods") or []
    today_mood = next((m for m in moods if m.get("date") == today), None)
    return json.dumps({
        "date": today,
        "pending_tasks": pending,
        "pending_count": len(pending),
        "mood": today_mood,
    }, ensure_ascii=False)


# ─── Export tools ───

def _iso_week_range(week_offset: int = 0):
    """Return (week_start, week_end, week_label) for ISO week relative to now."""
    today = datetime.now().date()
    monday = today - timedelta(days=today.weekday()) + timedelta(weeks=week_offset)
    sunday = monday + timedelta(days=6)
    iso_year, iso_week, _ = monday.isocalendar()
    label = f"{iso_year}-W{iso_week:02d}"
    return monday, sunday, label


@mcp.tool()
def export_to_wiki(week_offset: int = 0) -> str:
    """导出 ForgeOS 周报为 Markdown 字符串，供 AI 写入知识库。

    汇总指定周的每日反思、心情能量趋势和 OKR 进度。
    导出方向: Forge → wiki 单向。

    Args:
        week_offset: 周偏移量，0=本周，-1=上周，默认 0

    Returns:
        Markdown 字符串（含周复盘、心情趋势、OKR 进度三段）
    """
    _check_server()
    monday, sunday, label = _iso_week_range(week_offset)
    start_str = monday.strftime("%Y-%m-%d")
    end_str = sunday.strftime("%Y-%m-%d")
    lines = [f"# ForgeOS 周报 {label}（{start_str} ~ {end_str}）", ""]

    # ── Reflections ──
    reflections = _get("reflections") or []
    week_reflections = [r for r in reflections if start_str <= r.get("date", "") <= end_str]
    week_reflections.sort(key=lambda r: r.get("date", ""))
    lines.append("## 本周复盘")
    if week_reflections:
        for r in week_reflections:
            lines.append(f"### {r.get('date', '?')}")
            answers = r.get("answers", {})
            if isinstance(answers, dict):
                for k, v in answers.items():
                    lines.append(f"- **{k}**: {v}")
            tags = r.get("tags", [])
            if tags:
                lines.append(f"- 标签: {', '.join(tags)}")
            lines.append("")
    else:
        lines.append("（本周暂无复盘记录）")

    # ── Mood / Energy ──
    moods = _get("moods") or []
    week_moods = [m for m in moods if start_str <= m.get("date", "") <= end_str]
    week_moods.sort(key=lambda m: m.get("date", ""))
    lines.append("## 心情能量趋势")
    if week_moods:
        lines.append("| 日期 | 心情 | 能量 | 备注 |")
        lines.append("|------|------|------|------|")
        for m in week_moods:
            lines.append(f"| {m.get('date','')} | {m.get('mood','-')} | {m.get('energy','-')} | {m.get('note','')} |")
        avg_mood = sum(m.get("mood", 0) for m in week_moods) / len(week_moods)
        avg_energy = sum(m.get("energy", 0) for m in week_moods) / len(week_moods)
        lines.append(f"\n周均心情 {avg_mood:.1f} / 周均能量 {avg_energy:.1f}")
    else:
        lines.append("（本周暂无心情记录）")
    lines.append("")

    # ── OKR ──
    objectives = _get("objectives") or []
    lines.append("## OKR 进度")
    if objectives:
        for obj in objectives:
            lines.append(f"### {obj.get('title', '?')}（{obj.get('period', '?')}）")
            krs = obj.get("keyResults", [])
            done = sum(1 for kr in krs if kr.get("completed"))
            lines.append(f"关键结果: {done}/{len(krs)} 完成")
            for kr in krs:
                mark = "[x]" if kr.get("completed") else "[ ]"
                lines.append(f"- {mark} {kr.get('content', '')}")
            lines.append("")
    else:
        lines.append("（暂无 OKR）")
    lines.append("")

    lines.append(f"\n> 来源: ForgeOS 自动导出 | 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    return "\n".join(lines)


# ─── Smart tools (AI context → ForgeOS) ───

@mcp.tool()
def batch_create_tasks(items: str, date: str) -> str:
    """从会话上下文提炼出的多个事项,一次性批量创建任务。

    AI 分析整段会话上下文后,把提炼出的多条可执行事项用本工具一次性写入。
    每个 item 的 content 必须是简短行动摘要(≤20字,动宾结构),不含修饰语/文档引用/技术细节。
    使用单次 read-modify-write 避免多次调用 create_task 的竞态问题。

    Args:
        items: JSON 数组字符串,每项含 content 和可选 column, 如 [{"content":"写测试","column":"WED"},{"content":"修bug"}]
        date: 任务日期 YYYY-MM-DD

    Returns:
        创建的任务列表 JSON
    """
    _check_server()
    task_list = json.loads(items) if isinstance(items, str) else items
    tasks = _get("tasks") or []
    base_order = len(tasks)
    created = []
    for i, item in enumerate(task_list):
        col = item.get("column") or _date_to_column(date)
        task = {
            "id": _gen_id("task"),
            "content": item["content"],
            "column": col,
            "date": date,
            "status": "active",
            "order": base_order + i,
        }
        tasks.append(task)
        created.append(task)
    _put("tasks", tasks)
    return json.dumps(created, ensure_ascii=False)


@mcp.tool()
def create_session_reflection(date: str, summary: str, tags: str = "", session_source: str = "AI会话") -> str:
    """将本次 AI 会话内容结构化为复盘记录写入 ForgeOS。

    AI 总结本次会话的关键内容(做了什么/卡在哪/下一步)后,调用本工具写入。

    Args:
        date: 复盘日期 YYYY-MM-DD
        summary: AI 总结的会话内容(自由文本,AI 已结构化)
        tags: 额外标签逗号分隔
        session_source: 会话来源标记,默认"AI会话",可传"Codex"/"Claude"等

    Returns:
        创建的复盘 JSON
    """
    _check_server()
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    tag_list.append(session_source)
    reflections = _get("reflections") or []
    reflection = {
        "id": _gen_id("reflection"),
        "date": date,
        "kind": "daily",
        "templateId": "session",
        "answers": {"会话总结": summary},
        "tags": list(set(tag_list)),
        "createdAt": datetime.now().isoformat(),
    }
    reflections.append(reflection)
    _put("reflections", reflections)
    return json.dumps(reflection, ensure_ascii=False)


@mcp.tool()
def create_okr_from_text(title: str, period: str, key_results: str) -> str:
    """将一段目标描述拆解为 OKR(Objective + KeyResults)写入 ForgeOS。

    AI 已完成拆解后,调用本工具结构化写入。

    Args:
        title: 目标标题(AI 已提炼)
        period: 周期,如 "2026-07" 或 "2026Q3"
        key_results: JSON 数组字符串,如 [{"content":"完成MCP","completed":false},{"content":"上线P2","completed":false}]

    Returns:
        创建的 OKR JSON
    """
    _check_server()
    kr_list = json.loads(key_results) if isinstance(key_results, str) else key_results
    objectives = _get("objectives") or []
    obj = {
        "id": _gen_id("obj"),
        "title": title,
        "period": period,
        "keyResults": kr_list,
    }
    objectives.append(obj)
    _put("objectives", objectives)
    return json.dumps(obj, ensure_ascii=False)


@mcp.tool()
def convert_inspiration_to_task(inspiration_id: str, date: str) -> str:
    """将已有灵感转换为带日期和列的任务。

    取灵感内容,创建为任务,并在灵感记录上标记 convertedToTaskId。

    Args:
        inspiration_id: 灵感 ID
        date: 任务日期 YYYY-MM-DD

    Returns:
        创建的任务 JSON
    """
    _check_server()
    inspirations = _get("inspirations") or []
    target = None
    for insp in inspirations:
        if insp.get("id") == inspiration_id:
            target = insp
            break
    if not target:
        return json.dumps({"error": f"inspiration {inspiration_id} not found"}, ensure_ascii=False)
    tasks = _get("tasks") or []
    task = {
        "id": _gen_id("task"),
        "content": target.get("content", ""),
        "column": _date_to_column(date),
        "date": date,
        "status": "active",
        "order": len(tasks),
    }
    tasks.append(task)
    _put("tasks", tasks)
    # mark inspiration as converted
    target["convertedToTaskId"] = task["id"]
    _put("inspirations", inspirations)
    return json.dumps(task, ensure_ascii=False)


# ─── Smart tools (ForgeOS data → AI insights) ───

@mcp.tool()
def draft_weekly_review(week_offset: int = 0) -> str:
    """读本周数据,生成周复盘草稿供 AI 润色。

    汇总本周任务完成情况、每日反思、心情趋势,返回结构化数据。
    AI 在此基础上生成自然语言的周复盘(完成什么/卡在哪/下周调整一件)。
    草稿需用户确认后才写入 ForgeOS。

    Args:
        week_offset: 周偏移量,0=本周,默认 0

    Returns:
        周复盘草稿 JSON(含任务统计/反思列表/心情趋势)
    """
    _check_server()
    monday, sunday, label = _iso_week_range(week_offset)
    start_str = monday.strftime("%Y-%m-%d")
    end_str = sunday.strftime("%Y-%m-%d")

    tasks = _get("tasks") or []
    week_tasks = [t for t in tasks if start_str <= t.get("date", "") <= end_str]
    completed = [t for t in week_tasks if t.get("status") == "completed"]
    pending = [t for t in week_tasks if t.get("status") == "active"]

    reflections = _get("reflections") or []
    week_reflections = [r for r in reflections if start_str <= r.get("date", "") <= end_str]

    moods = _get("moods") or []
    week_moods = [m for m in moods if start_str <= m.get("date", "") <= end_str]
    avg_mood = sum(m.get("mood", 0) for m in week_moods) / len(week_moods) if week_moods else None
    avg_energy = sum(m.get("energy", 0) for m in week_moods) / len(week_moods) if week_moods else None

    return json.dumps({
        "week_label": label,
        "date_range": f"{start_str} ~ {end_str}",
        "task_summary": {
            "total": len(week_tasks),
            "completed": len(completed),
            "pending": len(pending),
            "completion_rate": round(len(completed) / len(week_tasks), 2) if week_tasks else 0,
        },
        "pending_tasks": [{"id": t["id"], "content": t["content"]} for t in pending],
        "completed_tasks": [{"id": t["id"], "content": t["content"]} for t in completed],
        "reflections": [{"date": r.get("date"), "tags": r.get("tags", [])} for r in week_reflections],
        "mood_trend": {
            "avg_mood": round(avg_mood, 1) if avg_mood else None,
            "avg_energy": round(avg_energy, 1) if avg_energy else None,
            "entries": len(week_moods),
        },
        "instruction": "AI 请基于以上数据生成周复盘: 本周完成了什么, 卡在哪, 下周调整一件。草稿需用户确认后写入。",
    }, ensure_ascii=False)


@mcp.tool()
def get_productivity_insights(days: int = 7) -> str:
    """读取近 N 天的任务完成率和心情能量关联,供 AI 给出趋势分析。

    Args:
        days: 最近多少天,默认 7

    Returns:
        效率洞察 JSON(含每日完成率/心情能量/趋势判断)
    """
    _check_server()
    cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    tasks = _get("tasks") or []
    recent_tasks = [t for t in tasks if t.get("date", "") >= cutoff]

    moods = _get("moods") or []
    recent_moods = [m for m in moods if m.get("date", "") >= cutoff]
    recent_moods.sort(key=lambda m: m.get("date", ""))

    # daily breakdown
    daily = {}
    for t in recent_tasks:
        d = t.get("date", "")
        if d not in daily:
            daily[d] = {"total": 0, "completed": 0}
        daily[d]["total"] += 1
        if t.get("status") == "completed":
            daily[d]["completed"] += 1

    for m in recent_moods:
        d = m.get("date", "")
        if d not in daily:
            daily[d] = {"total": 0, "completed": 0}
        daily[d]["mood"] = m.get("mood")
        daily[d]["energy"] = m.get("energy")

    daily_list = []
    for d in sorted(daily.keys()):
        info = daily[d]
        rate = info["completed"] / info["total"] if info["total"] > 0 else None
        daily_list.append({
            "date": d,
            "tasks_total": info["total"],
            "tasks_completed": info["completed"],
            "completion_rate": round(rate, 2) if rate is not None else None,
            "mood": info.get("mood"),
            "energy": info.get("energy"),
        })

    total_tasks = len(recent_tasks)
    total_completed = sum(1 for t in recent_tasks if t.get("status") == "completed")
    avg_mood = sum(m.get("mood", 0) for m in recent_moods) / len(recent_moods) if recent_moods else None
    avg_energy = sum(m.get("energy", 0) for m in recent_moods) / len(recent_moods) if recent_moods else None

    return json.dumps({
        "period": f"近 {days} 天",
        "overall": {
            "total_tasks": total_tasks,
            "completed": total_completed,
            "completion_rate": round(total_completed / total_tasks, 2) if total_tasks else 0,
            "avg_mood": round(avg_mood, 1) if avg_mood else None,
            "avg_energy": round(avg_energy, 1) if avg_energy else None,
        },
        "daily": daily_list,
        "instruction": "AI 请基于以上数据给出效率趋势分析: 完成率趋势, 心情能量与完成率的关联, 建议。",
    }, ensure_ascii=False)


if __name__ == "__main__":
    mcp.run()
