// someSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from '../apollo/__generated__/graphql';

interface SelectedAgent {
  value: Agent | null;
}

const initialState: SelectedAgent = {
  value: null,
};

const selectAgentSlice = createSlice({
  name: 'some',
  initialState,
  reducers: {
    selectAgent(state, action: PayloadAction<Agent>) {
        state.value = action.payload
    }
  },
});

export const { selectAgent } = selectAgentSlice.actions;
export default selectAgentSlice.reducer;
