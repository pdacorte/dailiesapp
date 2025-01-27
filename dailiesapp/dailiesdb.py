import sqlite3
from datetime import date, timedelta

conn = sqlite3.connect("dailies.db", check_same_thread=False)

c = conn.cursor()


# Table
# Basic Database Interactions

def create_table():
    c.execute('CREATE TABLE IF NOT EXISTS tasktable(id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, task_type TEXT, task_status BOOLEAN DEFAULT FALSE, task_start_date DATE, task_end_date DATE)')

def create_row(task, task_type, task_status, task_start_date):
    c.execute('INSERT INTO tasktable(task, task_type, task_status, task_start_date) VALUES (?,?,?,?)', (task, task_type, task_status, task_start_date))
    conn.commit()

def select_all():
    c.execute('SELECT * FROM tasktable')
    # Keep data post execution
    data = c.fetchall()
    return data

def select_unique():
    c.execute("SELECT DISTINCT task FROM tasktable")
    data = c.fetchall()
    return data

def return_task(task):
    c.execute("SELECT * FROM tasktable WHERE task='{}'".format(task))
    data = c.fetchall()
    return data

def last_5():
    c.execute("SELECT * FROM tasktable WHERE task_status = 1 ORDER BY task_end_date DESC, id DESC LIMIT 5;")
    data = c.fetchall()
    return data

def update_row(updated_task, updated_task_type, updated_task_status, updated_task_start_date, task, task_type, task_status, task_start_date):
    c.execute('UPDATE tasktable SET task=?, task_type=?, task_status=?, task_start_date=? WHERE task=? AND task_type=? AND task_status=? AND task_start_date=?', (updated_task, updated_task_type, updated_task_status, updated_task_start_date, task, task_type, task_status, task_start_date))
    conn.commit()

def delete_row(task):
    c.execute('DELETE FROM tasktable WHERE task="{}"'.format(task))
    conn.commit()

# This one is such a mess. There's a bit of redundancy with some logic handled in dailies.py and some here, fix that asap. 
def status_change(updated_task_status, taskid, task, task_type, task_end_date):
    today = date.today().strftime("%Y-%m-%d")
    tomorrow = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")

    # Issue > Loops through all of tasks with status 1 and inserts for each task with the same name that is done
    if updated_task_status==1 and task_type == "Non-Negotiable" and task_end_date == None:
        
        c.execute('UPDATE tasktable SET task_status=?, task_end_date=? WHERE id = ?', (updated_task_status,today,taskid))
        conn.commit()
        c.execute('INSERT OR IGNORE INTO tasktable (task, task_type, task_status, task_start_date, task_end_date) VALUES (?, ?, ?, ?, NULL)', (task, "Non-Negotiable", 0, tomorrow))
        conn.commit()
        print("This is state 1")
        # If the task is a non-negotiable (Daily?), then we replicate it for tomorrow
        
        conn.commit()
        print(taskid)
    elif updated_task_status==1 and task_type == "Goal":
        c.execute('UPDATE tasktable SET task_status=?, task_end_date=? WHERE id = ?', (updated_task_status,today,taskid))
        conn.commit()
        print("This is state 2")

    elif updated_task_status !=1 :
        # If task_status is not 1, then clear task_end_date
        c.execute('UPDATE tasktable SET task_status=?, task_end_date=NULL WHERE id=?',(updated_task_status, taskid))
        print("This is state 3")
        conn.commit()


def last_30_day_completed():
    last30d = (date.today() - timedelta(days=30)).strftime('%Y-%m-%d')
    data = c.execute("SELECT COUNT(*) FROM tasktable WHERE task_end_date >= ? AND task_status = 1", (last30d,))
    return data.fetchone()[0]

def get_completed_count_for_date(date):
    date_str = date.strftime('%Y-%m-%d')
    c.execute("""
        SELECT COUNT(*) 
        FROM tasktable 
        WHERE task_status = 1 
        AND task_end_date = ?
    """, (date_str,))
    return c.fetchone()[0]

def today_completed():
    today = date.today().strftime('%Y-%m-%d')
    c.execute("""
        SELECT COUNT(*) 
        FROM tasktable 
        WHERE task_status = 1 
        AND task_end_date = ?
    """, (today,))
    return c.fetchone()[0]

def get_current_streak():
    today = date.today()
    streak = 0
    current_date = today
    
    while True:
        date_str = current_date.strftime('%Y-%m-%d')
        c.execute("""
            SELECT COUNT(*) 
            FROM tasktable 
            WHERE task_status = 1 
            AND task_end_date = ?
        """, (date_str,))
        completed_count = c.fetchone()[0]
        
        if completed_count == 0:
            break
        
        streak += 1
        current_date -= timedelta(days=1)
    
    return streak

#"""
#Type - Choice - Non-Negotiable/Daily
#Goal - Text Field 
#Done - Boolean
#Date Set - Datetime
#Date Complete - Datetime
#POTENTIAL - Eisenhower? 
#"""