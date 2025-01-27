# Imports
import streamlit as st 
import pandas as pd
import plotly.express as px

import dailiesdb as db
from datetime import date, timedelta

# Main Hub - Overview


#Here there should be an overview of expected vs achieved for the last 3 months

#You have 2 tables: Non-Negotiables and Dailies

#Non-Negotiables are recurring and must be completed every day.

#Dailies are set through the day / the day before. 

#Potential Other Features:
#- Random Picked Motivational Quotes
#- Local Temperature / Weather Widget - DoD Delta
#- Kaizen Longest Streak
#- Email alert for missed tasks / Daily breakdown?
#- Pomodoro timer
#- Habit tracker + Creator > Set what habits you want to create and they'll become created after 30d of consecutive use. Reset after 1 day of failure
#- Kanban lists
#- AI Prompt to reduce bigger tasks into smaller goals - Deepseek Key = sk-bbe37ea5c818420ca3109621664005d2

# Cursor Shortcuts = Ctrl + I / Ctrl + L

st.set_page_config(layout="wide")

# Here we initialize the session state - Experimental
#if 'df' not in st.session_state:
#   st.session_state.df = pd.DataFrame(db.select_all)

# Here is how we automatically refresh the display when changes are made


def main():
    st.title("Dailies App")

    menu = ["Create","Read","Update", "Delete", "Extra"]
    choice = st.sidebar.selectbox("Menu", menu)

    # We initialize the table first IF NOT initialized
    db.create_table()


    # Now we introduce states - Create a new task
    if choice == "Create":
        st.subheader("Add Goal")

        # Create Page Layout

        col1,col2 = st.columns(2)

        with col1:
            task = st.text_input("Task to Do")
            task_type = st.selectbox("Task Type", ["Goal", "Non-Negotiable"])

        with col2:
            task_status = False
            task_start_date = st.date_input("Start Date",value="today")

        if st.button("Add Task"):
            db.create_row(task, task_type, task_status, task_start_date)
            st.success("Successfully added task: {}".format(task))



    elif choice == "Read":
        st.subheader("View Remaining Items")

        result = db.select_all()
        df = pd.DataFrame(result, columns=['Id', 'Task', 'Type', 'Status', 'Start Date', 'Finished Date'])
        df['Status'] = df["Status"].astype(bool)
        
        # First displayed item
        edited_df = st.data_editor(df[df["Status"].isin([False, 0])])
        
        with st.expander("Show all tasks"):
            st.dataframe(df)

        with st.expander("Statistics"):
            count_df = df['Status'].value_counts().to_frame()
            #count_df['Status'] = count_df["Status"].map({1: "Done", 0: "Not done"})
            st.dataframe(count_df)
        
        with st.expander("Visualize"):
            bar_chart = px.bar(count_df)
            bar_chart.update_xaxes(tickvals=[0, 1],ticktext=["Done", "Not done"])
            st.plotly_chart(bar_chart)
            

        #with st.expander("Making it good"):
        #    edited_df = st.data_editor(df[df["Status"].isin([False, 0])])
            #filtered_df = df[df["status"].isin([True, 1])]
    


    elif choice == "Update":
        st.subheader("Edit/Update Items")

        result = db.select_all()
        df = pd.DataFrame(result, columns=['Id','Task', 'Type', 'Status', 'Start Date', 'Finished Date'])
        df['Status'] = df["Status"].astype(bool)

        edited_df = st.data_editor(df)
        
        # Check if changes were made to df
        if not edited_df.equals(df):
            st.write("Changes detected. Updating database...")

            replicated_tasks = set()
            # Update the SQLite database by looping through all rows. If a row has a duplicate task name, then we add it 
            for index,row in edited_df.iterrows():
                taskid = row[0]
                task = row[1]
                task_type = row[2]
                updated_task_status = int(row[3])
                task_end_date = row[5]

                print("Lopping through {}".format(task))
                print(replicated_tasks)
                if task_type == "Non-Negotiable" and taskid in replicated_tasks:
                    continue  # Skip processing if task already replicated
                
                db.status_change(updated_task_status, taskid, task, task_type, task_end_date)

                # Add the task to the set if it's marked as done - Is this redundant? Test
                if updated_task_status == 1 and task_type == "Non-Negotiable":
                    replicated_tasks.add(taskid)


        list_of_tasks = [i[0] for i in db.select_unique()]
        st.write(list_of_tasks)

        selected_task = st.selectbox("Task to Edit", list_of_tasks)

        selected_result = db.return_task(selected_task)


        # Update Part
        if selected_result:
            task = selected_result[0][1]
            task_type = selected_result[0][2]
            task_status = selected_result[0][3]
            task_start_date = selected_result[0][4]


            col1,col2 = st.columns(2)

            with col1:
                updated_task = st.text_input("Task to Do", task)
                if task_type == "Goal":
                    type_index = 0
                else:
                    type_index = 1
                updated_task_type = st.selectbox("Task Type", ["Goal", "Non-Negotiable"], index=type_index)

            with col2:
                if task_status == "Not done":
                    status_index = 0
                else:
                    status_index = 1
                updated_task_status = st.selectbox("Done?", [True, False], index=status_index)
                updated_task_start_date = st.date_input("Start Date",value=task_start_date)

            if st.button("Update Task"):
                db.update_row(updated_task, updated_task_type, updated_task_status, updated_task_start_date, task, task_type, task_status, task_start_date)
                st.success("Successfully updated task: {} to {}".format(task,updated_task))

            with st.expander("Updated Data"):
                result2 = db.select_all()
                df2 = pd.DataFrame(result2, columns=['Id','Task', 'Type', 'Status', 'Start Date', 'Finished Date'])
                st.dataframe(df2)




    elif choice == "Delete":
        st.subheader("Delete Item")

        with st.expander("Current Data"):
                result2 = db.select_all()
                df2 = pd.DataFrame(result2, columns=['Id','Task', 'Type', 'Status', 'Start Date', 'Finished Date'])
                st.dataframe(df2)
        
        
        list_of_tasks = [i[0] for i in db.select_unique()]
        selected_task = st.selectbox("Task to Delete", list_of_tasks)
        st.warning("Do you want to delete {}?".format(selected_task))

        if st.button("Delete Task"):
            db.delete_row(selected_task)
            st.success("Successfully deleted task: {}".format(selected_task))

    else:
        today_count = db.today_completed()
        st.subheader("Today is the {} of {}! You have completed {} tasks today.".format(
            date.today().day, 
            date.today().strftime("%B"),
            today_count
        ))

        

        col1,col2 = st.columns(2)

        with col1:
            st.subheader("Ongoing Tasks")
            result = db.select_all()
            df = pd.DataFrame(result, columns=['#', 'Task', 'Type', 'Status', 'Start Date', 'Finished Date'])
            df['Status'] = df["Status"].astype(bool)
        
            # First displayed item
            edited_df = st.data_editor(df[df["Status"].isin([False, 0])], hide_index=True)

            # Check if changes were made to df
            if not edited_df.values.tolist() == (df[df["Status"].isin([False, 0])].values.tolist()):
                st.write("Changes detected. Updating database...")

                #Debugging
                print(edited_df.values)
                print(df[df["Status"].isin([False, 0])].values)

                
                # Update the SQLite database by looping through all rows. If a row has a duplicate task name, then we add it 
                for index,row in edited_df.iterrows():
                    taskid = row[0]
                    task = row[1]
                    task_type = row[2]
                    updated_task_status = int(row[3])
                    task_end_date = row[5]

                    
                    db.status_change(updated_task_status, taskid, task, task_type, task_end_date)

                st.rerun()


            st.subheader("Add Task")

            extra_col1, extra_col2 = st.columns(2)
            with extra_col1:
                task = st.text_input("Task to Do")
                task_type = st.selectbox("Task Type", ["Goal", "Non-Negotiable"])

                task_status = False
                task_start_date = st.date_input("Start Date",value="today")

                if st.button("Add Task"):
                    db.create_row(task, task_type, task_status, task_start_date)
                    st.success("Successfully added task: {}".format(task))
                    st.rerun()


        with col2:
            st.subheader("Last 5 Completed Tasks")
            last5 = db.last_5()
            df3 = pd.DataFrame(last5)
        
            st.dataframe(df3, hide_index=True)

            st.subheader("Last 7 Days Overview")
            count_df = df['Status'].value_counts().to_frame()
            st.dataframe(count_df)

            current_streak = db.get_current_streak()
            st.metric("🔥 Current Streak", f"{current_streak} days")
            
            with st.expander("Visualize"):
                # Get expected number of tasks per day (default=1)
                expected_number_input = st.number_input("Expected daily tasks", value=1, min_value=1)
                
                # Generate dates for x-axis (last 30 days)
                today = date.today()
                dates = [(today - timedelta(days=x)) for x in range(29, -1, -1)]
                
                # Get actual completed tasks for each day
                actual_counts = []
                cumulative_actual = 0
                for d in dates:
                    count = db.get_completed_count_for_date(d)
                    cumulative_actual += count
                    actual_counts.append(cumulative_actual)
                
                # Create cumulative expected counts
                expected_counts = [expected_number_input * (i + 1) for i in range(30)]
                
                # Create DataFrame for plotting
                df_plot = pd.DataFrame({
                    'Date': dates,
                    'Expected': expected_counts,
                    'Actual': actual_counts
                })

                # Create line chart
                fig = px.line(df_plot, x='Date', y=['Expected', 'Actual'],
                             title='Cumulative Expected vs Actual Completed Tasks (Last 30 Days)',
                             labels={'value': 'Total Number of Tasks', 'variable': 'Type'})
                
                st.plotly_chart(fig)




if __name__ == '__main__':
    main()
# Setting Goals Page - Create, Update, Delete records/tasks

# Database/Table Structure

#"""
#Type - Choice - Non-Negotiable/Daily
#Goal - Text Field 
#Done - Boolean
#Date Set - Datetime
#Date Complete - Datetime
#POTENTIAL - Eisenhower? 
#"""